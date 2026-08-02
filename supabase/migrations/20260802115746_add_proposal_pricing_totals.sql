begin;

create or replace function public.calculate_proposal_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.subtotal := 0;
  else
    select coalesce(
      sum(proposal_items.line_total),
      0
    )
    into new.subtotal
    from public.proposal_items
    where proposal_items.proposal_id = new.id;
  end if;

  new.total :=
    case new.discount_type
      when 'percentage' then
        greatest(
          round(
            new.subtotal -
            (
              new.subtotal *
              new.discount_value /
              100
            ),
            2
          ),
          0
        )

      when 'fixed' then
        greatest(
          round(
            new.subtotal -
            new.discount_value,
            2
          ),
          0
        )

      else
        round(new.subtotal, 2)
    end;

  return new;
end;
$$;

drop trigger if exists
  proposals_calculate_totals
on public.proposals;

create trigger proposals_calculate_totals
before insert or update
on public.proposals
for each row
execute function public.calculate_proposal_totals();

create or replace function public.refresh_proposal_pricing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_proposal_id uuid;
begin
  if tg_op = 'DELETE' then
    v_proposal_id := old.proposal_id;

  elsif tg_op = 'INSERT' then
    v_proposal_id := new.proposal_id;

  else
    if old.proposal_id is distinct from new.proposal_id then
      update public.proposals
      set subtotal = subtotal
      where id = old.proposal_id;
    end if;

    v_proposal_id := new.proposal_id;
  end if;

  update public.proposals
  set subtotal = subtotal
  where id = v_proposal_id;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists
  proposal_items_refresh_pricing
on public.proposal_items;

create trigger proposal_items_refresh_pricing
after insert or update or delete
on public.proposal_items
for each row
execute function public.refresh_proposal_pricing();

update public.proposals
set subtotal = subtotal;

revoke all
on function public.calculate_proposal_totals()
from public;

revoke all
on function public.refresh_proposal_pricing()
from public;

commit;