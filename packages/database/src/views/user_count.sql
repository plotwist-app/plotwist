create view
  public.user_count as
select
  count(*) as user_count
from
  auth.users;