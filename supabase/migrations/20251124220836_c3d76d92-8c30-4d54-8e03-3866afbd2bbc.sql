-- Create a function to clean up duplicate primary enrollments
-- This will be run once to fix existing data
CREATE OR REPLACE FUNCTION cleanup_duplicate_primary_enrollments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For each user with multiple primary enrollments, keep only the most recent
  UPDATE user_subject_enrollments
  SET is_primary = false
  WHERE id IN (
    SELECT e.id
    FROM user_subject_enrollments e
    INNER JOIN (
      SELECT user_id, MAX(enrolled_at) as max_enrolled
      FROM user_subject_enrollments
      WHERE is_primary = true
      GROUP BY user_id
      HAVING COUNT(*) > 1
    ) dupes ON e.user_id = dupes.user_id
    WHERE e.is_primary = true
      AND e.enrolled_at < dupes.max_enrolled
  );
END;
$$;

-- Run the cleanup
SELECT cleanup_duplicate_primary_enrollments();

-- Drop the function after use
DROP FUNCTION cleanup_duplicate_primary_enrollments();