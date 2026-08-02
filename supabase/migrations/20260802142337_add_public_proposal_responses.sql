begin;

alter table public.proposal_responses
add column if not exists client_comment text;

alter table public.proposal_responses
drop constraint if exists
  proposal_responses_client_comment_check;

alter table public.proposal_responses
add constraint
  proposal_responses_client_comment_check
check (
  client_comment is null
  or char_length(client_comment) <= 2000
);

create or replace function public.respond_public_proposal(
  p_public_token text,
  p_response text,
  p_client_name text,
  p_client_email text,
  p_client_comment text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_proposal_id uuid;
  v_proposal_status text;

  v_existing_response
    public.proposal_response_type;

  v_existing_responded_at
    timestamp with time zone;

  v_response
    public.proposal_response_type;

  v_client_name text :=
    nullif(btrim(p_client_name), '');

  v_client_email text :=
    nullif(lower(btrim(p_client_email)), '');

  v_client_comment text :=
    nullif(btrim(p_client_comment), '');

  v_responded_at
    timestamp with time zone;
begin
  if p_response not in (
    'accepted',
    'rejected'
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_response',
      'message',
        'Select a valid proposal response.'
    );
  end if;

  v_response :=
    p_response::public.proposal_response_type;

  if v_client_name is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_name',
      'message',
        'Enter your name.'
    );
  end if;

  if char_length(v_client_name) > 120 then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_name',
      'message',
        'Name must contain no more than 120 characters.'
    );
  end if;

  if v_client_email is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_email',
      'message',
        'Enter your email address.'
    );
  end if;

  if
    char_length(v_client_email) > 320
    or v_client_email !~*
      '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_email',
      'message',
        'Enter a valid email address.'
    );
  end if;

  if
    v_client_comment is not null
    and char_length(v_client_comment) > 2000
  then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_comment',
      'message',
        'Comment must contain no more than 2000 characters.'
    );
  end if;

  select
    proposal.id,
    proposal.status::text
  into
    v_proposal_id,
    v_proposal_status
  from public.proposals as proposal
  where proposal.public_token = p_public_token
    and proposal.status::text in (
      'sent',
      'viewed',
      'accepted',
      'rejected',
      'expired'
    )
  for update
  limit 1;

  if v_proposal_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'not_found',
      'message',
        'The proposal could not be found.'
    );
  end if;

  select
    proposal_response.response,
    proposal_response.responded_at
  into
    v_existing_response,
    v_existing_responded_at
  from public.proposal_responses
    as proposal_response
  where proposal_response.proposal_id =
    v_proposal_id
  limit 1;

  if found then
    return jsonb_build_object(
      'ok', false,
      'code', 'already_responded',
      'message',
        'This proposal has already received a response.',
      'status',
        v_existing_response::text,
      'respondedAt',
        v_existing_responded_at
    );
  end if;

  if v_proposal_status = 'expired' then
    return jsonb_build_object(
      'ok', false,
      'code', 'expired',
      'message',
        'This proposal has expired.'
    );
  end if;

  if v_proposal_status in (
    'accepted',
    'rejected'
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'already_final',
      'message',
        'This proposal already has a final status.',
      'status',
        v_proposal_status
    );
  end if;

  if v_proposal_status not in (
    'sent',
    'viewed'
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'not_respondable',
      'message',
        'This proposal cannot receive a response.'
    );
  end if;

  insert into public.proposal_responses (
    proposal_id,
    response,
    client_name,
    client_email,
    client_comment
  )
  values (
    v_proposal_id,
    v_response,
    v_client_name,
    v_client_email,
    v_client_comment
  )
  returning responded_at
  into v_responded_at;

  if v_response =
    'accepted'::public.proposal_response_type
  then
    update public.proposals
    set status = 'accepted'
    where id = v_proposal_id;
  else
    update public.proposals
    set status = 'rejected'
    where id = v_proposal_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'status', v_response::text,
    'respondedAt', v_responded_at
  );
end;
$$;

revoke all
on function public.respond_public_proposal(
  text,
  text,
  text,
  text,
  text
)
from public;

grant execute
on function public.respond_public_proposal(
  text,
  text,
  text,
  text,
  text
)
to anon;

grant execute
on function public.respond_public_proposal(
  text,
  text,
  text,
  text,
  text
)
to authenticated;

commit;