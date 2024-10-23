create view
  public.reviews_with_replies as
select
  r.id,
  r.created_at,
  r.user_id,
  r.tmdb_id,
  r.media_type,
  r.review,
  r.rating,
  r.tmdb_title,
  r.tmdb_poster_path,
  r.tmdb_overview,
  json_build_object(
    'email',
    u.email,
    'raw_user_meta_data',
    u.raw_user_meta_data
  ) as user_info,
  json_agg(
    json_build_object(
      'raw_user_meta_data',
      ru.raw_user_meta_data,
      'id',
      rr.id,
      'created_at',
      rr.created_at,
      'user_id',
      rr.user_id,
      'reply',
      rr.reply
    )
  ) filter (
    where
      rr.id is not null
  ) as review_replies
from
  reviews r
  join auth.users u on r.user_id = u.id
  left join review_replies rr on r.id = rr.review_id
  left join auth.users ru on rr.user_id = ru.id
group by
  r.id,
  u.email,
  u.raw_user_meta_data;