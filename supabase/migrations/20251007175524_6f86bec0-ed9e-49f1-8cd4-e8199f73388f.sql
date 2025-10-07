-- Add RLS policy for users to delete their own resources
CREATE POLICY "Users can delete their own resources" 
ON learning_resources 
FOR DELETE 
USING (auth.uid() = added_by_user_id);

-- Add RLS policy for users to update their own resources (non-vote fields)
CREATE POLICY "Users can update their own resources" 
ON learning_resources 
FOR UPDATE 
USING (auth.uid() = added_by_user_id);