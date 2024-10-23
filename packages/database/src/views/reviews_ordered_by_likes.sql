create view
  public.reviews_ordered_by_likes as
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
  r.language,
  coalesce(l.like_count, 0::bigint) as likes_count,
  json_build_object(
    'id',
    p.id,
    'username',
    p.username,
    'image_path',
    p.image_path
  ) as "user"
from
  reviews r
  join profiles p on r.user_id = p.id
  left join (
    select
      likes.review_id,
      count(*) as like_count
    from
      likes
    group by
      likes.review_id
  ) l on r.id = l.review_id
order by
  l.like_count desc nulls last;