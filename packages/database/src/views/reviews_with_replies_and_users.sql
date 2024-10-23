create view
  public.reviews_with_replies_and_users as
select
  r.id as review_id,
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
  r.language,
  json_build_object(
    'id',
    p.id,
    'username',
    p.username,
    'image_path',
    p.image_path
  ) as "user",
  json_agg(
    json_build_object(
      'id',
      rr.id,
      'reply',
      rr.reply,
      'created_at',
      rr.created_at,
      'user',
      json_build_object(
        'id',
        rp.id,
        'username',
        rp.username,
        'image_path',
        rp.image_path
      )
    )
    order by
      rr.created_at
  ) filter (
    where
      rr.id is not null
  ) as replies
from
  reviews r
  left join profiles p on r.user_id = p.id
  left join review_replies rr on r.id = rr.review_id
  left join profiles rp on rr.user_id = rp.id
group by
  r.id,
  p.id;