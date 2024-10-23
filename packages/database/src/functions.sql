CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
AS $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, NEW.raw_user_meta_data->>'username');
  return new;
end;
$$;