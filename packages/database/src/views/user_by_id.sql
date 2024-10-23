create view
  public.user_by_id as
select
  users.id,
  users.raw_user_meta_data ->> 'username'::text as username
from
  auth.users;