begin;

create or replace function public.open_public_proposal(
  p_public_token text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_proposal_id uuid;
begin
  select proposal.id
  into v_proposal_id
  from public.proposals as proposal
  where proposal.public_token = p_public_token
    and proposal.status::text in (
      'sent',
      'viewed',
      'accepted',
      'rejected',
      'expired'
    )
  limit 1;

  if v_proposal_id is null then
    return null;
  end if;

  update public.proposals
  set status = 'viewed'
  where id = v_proposal_id
    and status::text = 'sent';

  return public.get_public_proposal(
    p_public_token
  );
end;
$$;

revoke all
on function public.open_public_proposal(text)
from public;

grant execute
on function public.open_public_proposal(text)
to anon;

grant execute
on function public.open_public_proposal(text)
to authenticated;

commit;