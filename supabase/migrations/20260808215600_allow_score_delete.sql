-- Repeatable score categories (e.g. Ticket to Ride route claims, generic
-- round entries) need to be removable by any player in the session, matching
-- the open-editing trust model used for insert/update.
create policy "public delete scores" on scores for delete using (true);
