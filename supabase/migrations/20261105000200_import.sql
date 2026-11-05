alter table public.browsing_history add column local_id text;
create unique index history_import_once on public.browsing_history(user_id,local_id) where local_id is not null;
create function public.archive_import(payload jsonb, include_history boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); e record; local_album jsonb; imported_item record; h jsonb; new_id uuid; conflicts integer:=0; imported integer:=0;
begin
 if u is null then raise exception 'Sign in required'; end if;
 if payload ? 'expectedUserId' and payload->>'expectedUserId' is distinct from u::text then raise exception 'Account changed. Import was not applied'; end if;
 if payload->>'version'<>'1' or octet_length(payload::text)>2500000 or jsonb_typeof(payload->'entries')<>'object' or jsonb_typeof(payload->'albums')<>'array' then raise exception 'Invalid import'; end if;
 perform pg_advisory_xact_lock(hashtext(u::text)); perform public.archive_snapshot();
 for e in select key,value from jsonb_each(payload->'entries') loop
   if (e.value->'work'->>'id') is distinct from e.key then raise exception 'Invalid work identifier'; end if;
   if exists(select 1 from public.archive_entries where user_id=u and work_id=e.key and rating is not null and e.value->>'rating' is not null and rating<>(e.value->>'rating')::numeric) then conflicts:=conflicts+1; end if;
   insert into public.archive_entries(user_id,work_id,snapshot,saved,wanted,rating) values(u,e.key,e.value->'work',(e.value->>'saved')::boolean,(e.value->>'wanted')::boolean,(e.value->>'rating')::numeric)
   on conflict(user_id,work_id) do update set saved=public.archive_entries.saved or excluded.saved,wanted=public.archive_entries.wanted or excluded.wanted,rating=coalesce(public.archive_entries.rating,excluded.rating);
 end loop;
 for local_album in select value from jsonb_array_elements(payload->'albums') loop
   if exists(select 1 from public.imported_albums where user_id=u and local_id=local_album->>'id') then continue; end if;
   insert into public.albums(owner_id,title,description,accent,layout,cover) values(u,local_album->>'title',local_album->>'description',local_album->>'accent',local_album->>'layout',local_album->'cover') returning id into new_id;
   for imported_item in select value,ordinality from jsonb_array_elements_text(local_album->'workIds') with ordinality loop
     if not exists(select 1 from public.archive_entries where user_id=u and work_id=imported_item.value) then raise exception 'Missing imported work'; end if;
     insert into public.album_items select new_id,imported_item.value,snapshot,imported_item.ordinality-1,u,new_id from public.archive_entries where user_id=u and work_id=imported_item.value;
   end loop;
   if local_album->'cover'->>'kind'='work' and not exists(select 1 from public.album_items where album_id=new_id and work_id=local_album->'cover'->>'workId') then raise exception 'Invalid imported cover'; end if;
   if local_album->'cover'->>'kind'='upload' then perform (local_album->'cover'->>'imageId')::uuid; end if;
   insert into public.imported_albums values(u,local_album->>'id',new_id); imported:=imported+1;
 end loop;
 update public.user_preferences set motion=case when motion='reduce' then motion else coalesce(payload->'preferences'->>'motion',motion) end where user_id=u;
 if include_history then
   for h in select value from jsonb_array_elements(payload->'history') loop
     insert into public.browsing_history(user_id,work_id,visited_at,local_id) values(u,h->>'workId',(h->>'visitedAt')::timestamptz,h->>'id') on conflict(user_id,local_id) where local_id is not null do nothing;
   end loop;
   update public.user_preferences set history_enabled=(payload->'preferences'->>'historyEnabled')::boolean where user_id=u;
   delete from public.browsing_history where user_id=u and id not in(select id from public.browsing_history where user_id=u order by visited_at desc limit 100);
 end if;
 if (select count(*) from public.archive_entries where user_id=u)>300 or (select count(*) from public.albums where owner_id=u)>50 or exists(select 1 from public.albums a where a.owner_id=u and (select count(*) from public.album_items i where i.album_id=a.id)>100) then raise exception 'Import exceeds archive limits'; end if;
 return jsonb_build_object('data',public.archive_snapshot(),'albumsImported',imported,'ratingConflicts',conflicts,'albumMap',(select coalesce(jsonb_object_agg(local_id,album_id),'{}') from public.imported_albums where user_id=u));
end $$;
revoke all on function public.archive_import(jsonb,boolean) from public;
grant execute on function public.archive_import(jsonb,boolean) to authenticated;
