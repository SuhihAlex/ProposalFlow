begin;

alter table public.proposals
add column if not exists public_token uuid;

update public.proposals
set public_token = gen_random_uuid()
where public_token is null;

alter table public.proposals
alter column public_token
set default gen_random_uuid();

alter table public.proposals
alter column public_token
set not null;

create unique index if not exists
  proposals_public_token_key
on public.proposals(public_token);

comment on column public.proposals.public_token is
  'Unpredictable token used for public client proposal access.';

create or replace function public.get_public_proposal(
  p_public_token text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'proposalNumber',
      proposal.proposal_number,

    'projectTitle',
      proposal.project_title,

    'brief',
      proposal.brief,

    'status',
      proposal.status::text,

    'currency',
      proposal.currency,

    'validUntil',
      proposal.valid_until,

    'subtotal',
      proposal.subtotal,

    'discountType',
      proposal.discount_type::text,

    'discountValue',
      proposal.discount_value,

    'total',
      proposal.total,

    'client',
      case
        when client.id is null then null
        else jsonb_build_object(
          'companyName',
            client.company_name,
          'contactName',
            client.contact_name
        )
      end,

    'items',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id',
                proposal_item.id,

              'name',
                proposal_item.name,

              'description',
                proposal_item.description,

              'quantity',
                proposal_item.quantity,

              'unit',
                proposal_item.unit::text,

              'unitPrice',
                proposal_item.unit_price,

              'lineTotal',
                proposal_item.line_total
            )
            order by proposal_item.position
          )
          from public.proposal_items
            as proposal_item
          where proposal_item.proposal_id =
            proposal.id
        ),
        '[]'::jsonb
      )
  )
  from public.proposals as proposal
  left join public.clients as client
    on client.id = proposal.client_id
  where proposal.public_token = p_public_token
    and proposal.status::text in (
      'sent',
      'viewed',
      'accepted',
      'rejected',
      'expired'
    )
  limit 1;
$$;

revoke all
on function public.get_public_proposal(text)
from public;

grant execute
on function public.get_public_proposal(text)
to anon;

grant execute
on function public.get_public_proposal(text)
to authenticated;

commit;