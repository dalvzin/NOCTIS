-- NOCTIS: todas as funções privilegiadas têm search_path fixo e autorização explícita.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique check (username ~ '^[a-z][a-z0-9_]{2,29}$'),
 display_name text not null default '' check(length(display_name)<=80),
 bio text not null default '' check(length(bio)<=1000),
 accent text not null default 'bronze' check(accent in ('bronze','sage','slate','rose')),
 is_public boolean not null default false,
 avatar_id uuid, cover_id uuid, updated_at timestamptz not null default now()
);
create table public.user_preferences (
 user_id uuid primary key references public.profiles(id) on delete cascade,
 history_enabled boolean not null default false,
 motion text not null default 'system' check(motion in ('system','reduce')),
 hide_activity boolean not null default true,
 public_ratings boolean not null default false,
 followers_scope text not null default 'private' check(followers_scope in ('public','followers','private')),
 following_scope text not null default 'private' check(following_scope in ('public','followers','private')),
 category_scopes jsonb not null default '{"books":"private","films":"private","games":"private","music":"private","photography":"private","art":"private","albums":"private","remixes":"private","follows":"private"}'
);
create table public.archive_entries (
 user_id uuid not null references public.profiles(id) on delete cascade,
 work_id text not null check(work_id ~ '^[a-zA-Z0-9_-]+:(books|films|games|music|photography|art):[a-zA-Z0-9_.:-]+$'),
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object' and snapshot->>'id'=work_id and octet_length(snapshot::text)<=18000),
 saved boolean not null default false, wanted boolean not null default false,
 rating numeric check(rating between 0.5 and 5 and mod(rating*2,1)=0),
 updated_at timestamptz not null default now(), primary key(user_id,work_id)
);
create table public.albums (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
 title text not null check(length(trim(title)) between 1 and 80), description text not null default '' check(length(description)<=1000),
 accent text not null default 'bronze' check(accent in ('bronze','sage','slate','rose')),
 layout text not null default 'grid' check(layout in ('grid','editorial','list')),
 visibility text not null default 'private' check(visibility in ('private','public','unlisted')),
 allow_remix boolean not null default false,
 cover jsonb not null default '{"kind":"none"}' check(jsonb_typeof(cover)='object' and cover->>'kind' in ('none','work','upload')),
 source_album_id uuid references public.albums(id) on delete set null,
 original_creator_id uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.album_items (
 album_id uuid not null references public.albums(id) on delete cascade,
 work_id text not null, snapshot jsonb not null check(snapshot->>'id'=work_id and octet_length(snapshot::text)<=18000),
 position integer not null check(position between 0 and 999),
 contributor_id uuid references public.profiles(id) on delete set null,
 origin_album_id uuid references public.albums(id) on delete set null,
 primary key(album_id,work_id), unique(album_id,position) deferrable initially deferred
);
alter table public.albums add constraint album_cover_shape check ((
 cover->>'kind'='none' or (cover->>'kind'='work' and cover->>'workId' ~ '^[a-zA-Z0-9_-]+:(books|films|games|music|photography|art):[a-zA-Z0-9_.:-]+$') or
 (cover->>'kind'='upload' and cover->>'imageId' ~ '^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$')
) is true);
create table public.album_shares (
 album_id uuid primary key references public.albums(id) on delete cascade,
 token text not null unique default replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','') check(length(token)=64)
);
create table public.album_likes (
 album_id uuid not null references public.albums(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(album_id,user_id)
);
create table public.follows (
 follower_id uuid not null references public.profiles(id) on delete cascade,
 followed_id uuid not null references public.profiles(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(follower_id,followed_id), check(follower_id<>followed_id)
);
create table public.browsing_history (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 work_id text not null, visited_at timestamptz not null default now(),
 foreign key(user_id,work_id) references public.archive_entries(user_id,work_id) on delete cascade
);
create table public.featured_albums (
 user_id uuid not null references public.profiles(id) on delete cascade,
 album_id uuid not null references public.albums(id) on delete cascade,
 position integer not null check(position between 0 and 5), primary key(user_id,album_id)
);
create table public.imported_albums (
 user_id uuid not null references public.profiles(id) on delete cascade,
 local_id text not null, album_id uuid not null references public.albums(id) on delete cascade,
 primary key(user_id,local_id)
);
create index albums_public_recent on public.albums(created_at desc) where visibility='public';
create index albums_owner on public.albums(owner_id);
create index follows_target on public.follows(followed_id);
create index history_owner_date on public.browsing_history(user_id,visited_at desc);

create function private.can_album(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.albums where id=p_id and (owner_id=auth.uid() or visibility='public'));
$$;
create function private.can_scope(p_owner uuid,p_scope text) returns boolean language sql stable security definer set search_path='' as $$
 select p_owner=auth.uid() or (exists(select 1 from public.profiles where id=p_owner and is_public) and
 (p_scope='public' or (p_scope='followers' and exists(select 1 from public.follows where followed_id=p_owner and follower_id=auth.uid()))));
$$;
create function private.can_follow_row(p_follower uuid,p_followed uuid) returns boolean language sql stable security definer set search_path='' as $$
 select p_follower=auth.uid() or p_followed=auth.uid() or
 (exists(select 1 from public.user_preferences where user_id=p_followed and private.can_scope(user_id,followers_scope)) and
 exists(select 1 from public.user_preferences where user_id=p_follower and private.can_scope(user_id,following_scope)));
$$;

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.archive_entries enable row level security;
alter table public.albums enable row level security;
alter table public.album_items enable row level security;
alter table public.album_shares enable row level security;
alter table public.album_likes enable row level security;
alter table public.follows enable row level security;
alter table public.browsing_history enable row level security;
alter table public.featured_albums enable row level security;
alter table public.imported_albums enable row level security;
create policy profiles_read on public.profiles for select using(id=auth.uid() or is_public);
create policy preferences_owner on public.user_preferences for select using(user_id=auth.uid());
create policy entries_owner on public.archive_entries for select using(user_id=auth.uid());
create policy albums_read on public.albums for select using(private.can_album(id));
create policy items_read on public.album_items for select using(exists(select 1 from public.albums where id=album_id and owner_id=auth.uid()));
create policy shares_owner on public.album_shares for select using(exists(select 1 from public.albums where id=album_id and owner_id=auth.uid()));
create policy likes_self on public.album_likes for select using(user_id=auth.uid() and private.can_album(album_id));
create policy follows_read on public.follows for select using(private.can_follow_row(follower_id,followed_id));
create policy history_owner on public.browsing_history for select using(user_id=auth.uid());
create policy featured_read on public.featured_albums for select using((user_id=auth.uid() or exists(select 1 from public.profiles where id=user_id and is_public)) and private.can_album(album_id));
create policy imports_owner on public.imported_albums for select using(user_id=auth.uid());
-- Escritas complexas passam pelas RPCs abaixo: cliente não pode forjar autoria.
revoke all on public.profiles,public.user_preferences,public.archive_entries,public.albums,public.album_items,public.album_shares,public.album_likes,public.follows,public.browsing_history,public.featured_albums,public.imported_albums from anon,authenticated;
grant select on public.profiles,public.albums,public.follows,public.featured_albums to anon,authenticated;
grant select on public.album_items to authenticated;
grant select on public.user_preferences,public.archive_entries,public.album_shares,public.album_likes,public.browsing_history,public.imported_albums to authenticated;

create function public.archive_snapshot() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb;
begin
 if u is null then raise exception 'Sign in required'; end if;
 insert into public.profiles(id) values(u) on conflict do nothing;
 insert into public.user_preferences(user_id) values(u) on conflict do nothing;
 select jsonb_build_object('version',1,'accountId',u,'entries',coalesce((select jsonb_object_agg(work_id,jsonb_build_object('work',snapshot,'saved',saved,'wanted',wanted,'rating',rating,'updatedAt',updated_at)) from public.archive_entries where user_id=u),'{}'::jsonb),
 'albums',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'title',a.title,'description',a.description,'accent',a.accent,'layout',a.layout,'visibility','private','workIds',coalesce((select jsonb_agg(i.work_id order by i.position) from public.album_items i where i.album_id=a.id),'[]'::jsonb),'cover',a.cover,'createdAt',a.created_at,'updatedAt',a.updated_at) order by a.created_at) from public.albums a where a.owner_id=u),'[]'::jsonb),
 'history',coalesce((select jsonb_agg(jsonb_build_object('id',h.id,'workId',h.work_id,'visitedAt',h.visited_at) order by h.visited_at desc) from public.browsing_history h where h.user_id=u),'[]'::jsonb),
 'preferences',(select jsonb_build_object('historyEnabled',history_enabled,'motion',motion) from public.user_preferences where user_id=u)) into result;
 return result;
end $$;

create function public.archive_mutate(command jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); kind text:=command->>'type'; aid uuid; wid text:=command->'work'->>'id'; f jsonb:=command->'fields'; pos integer; target integer; created uuid;
begin
 if u is null then raise exception 'Sign in required'; end if;
 if command ? 'expectedUserId' and command->>'expectedUserId' is distinct from u::text then raise exception 'Account changed. Retry in the intended account'; end if;
 perform pg_advisory_xact_lock(hashtext(u::text));
 perform public.archive_snapshot();
 if command ? 'work' then
   if octet_length((command->'work')::text)>18000 then raise exception 'Work snapshot too large'; end if;
   insert into public.archive_entries(user_id,work_id,snapshot) values(u,wid,command->'work') on conflict(user_id,work_id) do update set snapshot=excluded.snapshot,updated_at=now();
 end if;
 if command ? 'id' then aid:=(command->>'id')::uuid; end if;
 if kind in ('updateAlbum','albumWork','moveAlbumWork','deleteAlbum') and not exists(select 1 from public.albums where id=aid and owner_id=u) then raise exception 'Album unavailable'; end if;
 case kind
 when 'save' then update public.archive_entries set saved=(command->>'value')::boolean,updated_at=now() where user_id=u and work_id=wid;
 when 'want' then update public.archive_entries set wanted=(command->>'value')::boolean,updated_at=now() where user_id=u and work_id=wid;
 when 'rate' then update public.archive_entries set rating=(command->>'rating')::numeric,updated_at=now() where user_id=u and work_id=wid;
 when 'preferences' then update public.user_preferences set history_enabled=coalesce((command->'patch'->>'historyEnabled')::boolean,history_enabled),motion=coalesce(command->'patch'->>'motion',motion) where user_id=u;
 when 'createAlbum' then
   if (select count(*) from public.albums where owner_id=u)>=50 then raise exception 'Album limit reached'; end if;
   insert into public.albums(owner_id,title,description,accent,layout) values(u,trim(f->>'title'),f->>'description',f->>'accent',f->>'layout') returning id into created;
   if wid is not null then insert into public.album_items values(created,wid,command->'work',0,u,created); end if;
 when 'updateAlbum' then
   if f ? 'cover' and f->'cover'->>'kind'='work' and not exists(select 1 from public.album_items where album_id=aid and work_id=f->'cover'->>'workId') then raise exception 'Cover work is not in this album'; end if;
   if f ? 'cover' and f->'cover'->>'kind'='upload' then perform (f->'cover'->>'imageId')::uuid; end if;
   update public.albums set title=coalesce(trim(f->>'title'),title),description=coalesce(f->>'description',description),accent=coalesce(f->>'accent',accent),layout=coalesce(f->>'layout',layout),cover=coalesce(f->'cover',cover),updated_at=now() where id=aid;
 when 'albumWork' then
   if (command->>'value')::boolean then
     if (select count(*) from public.album_items where album_id=aid)>=100 then raise exception 'Album item limit reached'; end if;
     insert into public.album_items values(aid,wid,command->'work',coalesce((select max(position)+1 from public.album_items where album_id=aid),0),u,aid) on conflict(album_id,work_id) do nothing;
   else
     delete from public.album_items where album_id=aid and work_id=wid;
     update public.albums set cover='{"kind":"none"}' where id=aid and cover->>'kind'='work' and cover->>'workId'=wid;
     with ordered as(select work_id,row_number() over(order by position)-1 as n from public.album_items where album_id=aid) update public.album_items i set position=o.n from ordered o where i.album_id=aid and i.work_id=o.work_id;
   end if;
 when 'moveAlbumWork' then
   if (command->>'direction')::integer not in (-1,1) then raise exception 'Invalid direction'; end if;
   select position into pos from public.album_items where album_id=aid and work_id=command->>'workId'; target:=pos+(command->>'direction')::integer;
   if exists(select 1 from public.album_items where album_id=aid and position=target) then update public.album_items set position=case when position=pos then target else pos end where album_id=aid and position in(pos,target); end if;
 when 'deleteAlbum' then delete from public.albums where id=aid;
 when 'visit' then
   if (select history_enabled from public.user_preferences where user_id=u) and wid is distinct from (select work_id from public.browsing_history where user_id=u order by visited_at desc limit 1) then
     insert into public.browsing_history(user_id,work_id) values(u,wid);
     delete from public.browsing_history where user_id=u and id not in(select id from public.browsing_history where user_id=u order by visited_at desc limit 100);
   end if;
 when 'deleteHistory' then delete from public.browsing_history where user_id=u and id=aid;
 when 'clearHistory' then delete from public.browsing_history where user_id=u;
 when 'reset' then
   delete from public.albums where owner_id=u; delete from public.browsing_history where user_id=u; delete from public.archive_entries where user_id=u;
   update public.user_preferences set history_enabled=false,motion='system' where user_id=u;
 else raise exception 'Unsupported archive action';
 end case;
 delete from public.archive_entries e where e.user_id=u and not e.saved and not e.wanted and e.rating is null and not exists(select 1 from public.albums a join public.album_items i on i.album_id=a.id where a.owner_id=u and i.work_id=e.work_id) and not exists(select 1 from public.browsing_history h where h.user_id=u and h.work_id=e.work_id);
 if (select count(*) from public.archive_entries where user_id=u)>300 then raise exception 'Archive item limit reached'; end if;
 return jsonb_build_object('data',public.archive_snapshot(),'id',created);
end $$;

create function public.profile_update(fields jsonb) returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); scopes jsonb;
begin
 if u is null then raise exception 'Sign in required'; end if;
 if fields ? 'id' and fields->>'id' is distinct from u::text then raise exception 'Account changed'; end if;
 perform public.archive_snapshot();
 if fields ? 'username' and (fields->>'username' is null or fields->>'username' !~ '^[a-z][a-z0-9_]{2,29}$') then raise exception 'Username must use 3–30 lowercase letters, numbers or underscores and begin with a letter'; end if;
 update public.profiles set username=coalesce(fields->>'username',username),display_name=coalesce(fields->>'display_name',display_name),bio=coalesce(fields->>'bio',bio),accent=coalesce(fields->>'accent',accent),is_public=coalesce((fields->>'is_public')::boolean,is_public),avatar_id=case when fields ? 'avatar_id' then (fields->>'avatar_id')::uuid else avatar_id end,cover_id=case when fields ? 'cover_id' then (fields->>'cover_id')::uuid else cover_id end,updated_at=now() where id=u;
 if fields ? 'category_scopes' then
   scopes:=fields->'category_scopes';
   if jsonb_typeof(scopes)<>'object' or exists(select 1 from jsonb_each_text(scopes) where key not in ('books','films','games','music','photography','art','albums','remixes','follows') or value is null or value not in ('public','followers','private')) then raise exception 'Invalid activity scopes'; end if;
 end if;
 update public.user_preferences set hide_activity=coalesce((fields->>'hide_activity')::boolean,hide_activity),public_ratings=coalesce((fields->>'public_ratings')::boolean,public_ratings),followers_scope=coalesce(fields->>'followers_scope',followers_scope),following_scope=coalesce(fields->>'following_scope',following_scope),category_scopes=category_scopes||coalesce(scopes,'{}') where user_id=u;
 if fields ? 'featured' then
   if jsonb_array_length(fields->'featured')>6 then raise exception 'Up to six featured albums'; end if;
   delete from public.featured_albums where user_id=u;
   insert into public.featured_albums select u,(value#>>'{}')::uuid,ordinality-1 from jsonb_array_elements(fields->'featured') with ordinality where exists(select 1 from public.albums where id=(value#>>'{}')::uuid and owner_id=u and visibility='public');
 end if;
end $$;

create function public.album_publish(p_id uuid,p_visibility text,p_remix boolean default false,p_rotate boolean default false) returns text language plpgsql security definer set search_path='' as $$
declare result text;
begin
 if auth.uid() is null or not exists(select 1 from public.albums where id=p_id and owner_id=auth.uid()) then raise exception 'Album unavailable'; end if;
 if p_visibility not in ('private','public','unlisted') then raise exception 'Invalid visibility'; end if;
 update public.albums set visibility=p_visibility,allow_remix=(p_visibility='public' and p_remix),updated_at=now() where id=p_id;
 if p_visibility='unlisted' then
   if p_rotate then delete from public.album_shares where album_id=p_id; end if;
   insert into public.album_shares(album_id) values(p_id) on conflict do nothing;
   select token into result from public.album_shares where album_id=p_id;
 else delete from public.album_shares where album_id=p_id; end if;
 return result;
end $$;

create function public.album_read(p_id uuid default null,p_token text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.albums; result jsonb;
begin
 if p_token is not null then select al.* into a from public.albums al join public.album_shares s on s.album_id=al.id where s.token=p_token and al.visibility='unlisted';
 else select * into a from public.albums where id=p_id and (owner_id=auth.uid() or visibility='public'); end if;
 if a.id is null then return null; end if;
 select jsonb_build_object('id',a.id,'title',a.title,'description',a.description,'accent',a.accent,'layout',a.layout,'visibility',a.visibility,'allow_remix',a.allow_remix,'owner',a.owner_id=auth.uid(),
 'creator',(select jsonb_build_object('username',username,'display_name',display_name,'avatar_id',avatar_id,'id',id) from public.profiles where id=a.owner_id and (is_public or id=auth.uid())),
 'cover',a.cover,'media_owner',a.owner_id,
 'likes',(select count(*) from public.album_likes where album_id=a.id), 'liked',exists(select 1 from public.album_likes where album_id=a.id and user_id=auth.uid()),
 'source_album_id',(select id from public.albums where id=a.source_album_id and visibility='public'),
 'original_creator',(select username from public.profiles where id=a.original_creator_id and is_public),
 'items',coalesce((select jsonb_agg(jsonb_build_object('work',i.snapshot,'contributor',(select username from public.profiles where id=i.contributor_id and is_public),'origin_album_id',(select id from public.albums where id=i.origin_album_id and visibility='public')) order by i.position) from public.album_items i where i.album_id=a.id),'[]'::jsonb)) into result;
 return result;
end $$;

create function public.album_like(p_id uuid,p_value boolean,p_token text default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 if not private.can_album(p_id) and not exists(select 1 from public.album_shares s join public.albums a on a.id=s.album_id where a.id=p_id and a.visibility='unlisted' and s.token=p_token) then raise exception 'Album unavailable'; end if;
 if p_value then insert into public.album_likes(album_id,user_id) values(p_id,auth.uid()) on conflict do nothing; else delete from public.album_likes where album_id=p_id and user_id=auth.uid(); end if;
end $$;
create function public.profile_follow(p_id uuid,p_value boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or p_id=auth.uid() then raise exception 'Invalid follow'; end if;
 if p_value then
   if not exists(select 1 from public.profiles where id=p_id and is_public) then raise exception 'This profile does not accept follows'; end if;
   insert into public.follows values(auth.uid(),p_id,now()) on conflict do nothing;
 else delete from public.follows where follower_id=auth.uid() and followed_id=p_id; end if;
end $$;

create function public.profile_read(p_username text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare p public.profiles; pref public.user_preferences;
begin
 select * into p from public.profiles where username=p_username and (is_public or id=auth.uid()); if p.id is null then return null; end if;
 select * into pref from public.user_preferences where user_id=p.id;
 return jsonb_build_object('profile',to_jsonb(p),'following',exists(select 1 from public.follows where followed_id=p.id and follower_id=auth.uid()),
 'followers',case when private.can_scope(p.id,pref.followers_scope) then (select coalesce(jsonb_agg(jsonb_build_object('username',pr.username,'display_name',pr.display_name)),'[]') from public.follows f join public.profiles pr on pr.id=f.follower_id where f.followed_id=p.id and pr.is_public) else null end,
 'following_list',case when private.can_scope(p.id,pref.following_scope) then (select coalesce(jsonb_agg(jsonb_build_object('username',pr.username,'display_name',pr.display_name)),'[]') from public.follows f join public.profiles pr on pr.id=f.followed_id where f.follower_id=p.id and pr.is_public) else null end,
 'albums',(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'title',a.title,'description',a.description,'featured',exists(select 1 from public.featured_albums f where f.album_id=a.id and f.user_id=p.id)) order by a.created_at desc),'[]') from public.albums a where a.owner_id=p.id and a.visibility='public'),
 'ratings',case when not pref.hide_activity and pref.public_ratings then (select coalesce(jsonb_agg(jsonb_build_object('work',snapshot,'rating',rating)),'[]') from public.archive_entries e where e.user_id=p.id and e.rating is not null and private.can_scope(p.id,pref.category_scopes->>(e.snapshot->>'category'))) else '[]'::jsonb end);
end $$;

create function public.album_remix(p_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); a public.albums; new_id uuid;
begin
 if u is null then raise exception 'Sign in required'; end if;
 perform pg_advisory_xact_lock(hashtext(u::text)); perform public.archive_snapshot();
 select * into a from public.albums where id=p_id and visibility='public' and allow_remix for share;
 if a.id is null then raise exception 'Only public albums with remix permission can be remixed'; end if;
 if (select count(*) from public.albums where owner_id=u)>=50 then raise exception 'Album limit reached'; end if;
 insert into public.albums(owner_id,title,description,accent,layout,cover,source_album_id,original_creator_id)
 values(u,left('Remix · '||a.title,80),a.description,a.accent,a.layout,case when a.cover->>'kind'='work' then a.cover else '{"kind":"none"}'::jsonb end,a.id,coalesce(a.original_creator_id,a.owner_id)) returning id into new_id;
 insert into public.album_items select new_id,work_id,snapshot,position,contributor_id,origin_album_id from public.album_items where album_id=a.id;
 insert into public.archive_entries(user_id,work_id,snapshot) select u,work_id,snapshot from public.album_items where album_id=new_id on conflict do nothing;
 if (select count(*) from public.archive_entries where user_id=u)>300 then raise exception 'Archive item limit reached'; end if;
 return new_id;
end $$;

-- Preferências e históricos não têm nenhuma política de leitura pública.
-- Nega execução implícita a PUBLIC; concede apenas as RPCs intencionais.
revoke all on all functions in schema private from public;
grant execute on all functions in schema private to anon,authenticated;
revoke all on function public.archive_snapshot(),public.archive_mutate(jsonb),public.profile_update(jsonb),public.album_publish(uuid,text,boolean,boolean),public.album_read(uuid,text),public.album_like(uuid,boolean,text),public.profile_follow(uuid,boolean),public.profile_read(text),public.album_remix(uuid) from public;
grant execute on function public.archive_snapshot(),public.archive_mutate(jsonb),public.profile_update(jsonb),public.album_publish(uuid,text,boolean,boolean),public.album_like(uuid,boolean,text),public.profile_follow(uuid,boolean),public.album_remix(uuid) to authenticated;
grant execute on function public.album_read(uuid,text),public.profile_read(text) to anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('noctis-media','noctis-media',false,2097152,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=false,file_size_limit=2097152,allowed_mime_types=excluded.allowed_mime_types;
create policy media_insert_owner on storage.objects for insert to authenticated with check(bucket_id='noctis-media' and split_part(name,'/',1)=auth.uid()::text and split_part(name,'/',2) ~ '^[a-f0-9-]{36}$');
create policy media_delete_owner on storage.objects for delete to authenticated using(bucket_id='noctis-media' and split_part(name,'/',1)=auth.uid()::text);
create policy media_read on storage.objects for select using(bucket_id='noctis-media' and
 (split_part(name,'/',1)=auth.uid()::text or exists(select 1 from public.albums a where a.visibility='public' and a.cover->>'kind'='upload' and name=a.owner_id::text||'/'||(a.cover->>'imageId')) or
 exists(select 1 from public.profiles p where p.is_public and name=p.id::text||'/'||p.avatar_id::text) or exists(select 1 from public.profiles p where p.is_public and name=p.id::text||'/'||p.cover_id::text)));

grant execute on function public.album_read(uuid,text) to service_role;
