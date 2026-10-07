CREATE OR REPLACE FUNCTION protect_published_problem() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.status = 'published' THEN
  RAISE EXCEPTION 'Published problem versions are immutable; create a new version';
 END IF;
 IF TG_OP = 'DELETE' THEN
  RETURN OLD;
 END IF;
 RETURN NEW;
END;
$$;
