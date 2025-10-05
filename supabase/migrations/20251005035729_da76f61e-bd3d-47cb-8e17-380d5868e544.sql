-- Create vault_items table for storing encrypted password entries
CREATE TABLE public.vault_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  username TEXT,
  encrypted_password TEXT NOT NULL,
  url TEXT,
  encrypted_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own vault items
CREATE POLICY "Users can view their own vault items" 
ON public.vault_items 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own vault items
CREATE POLICY "Users can create their own vault items" 
ON public.vault_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own vault items
CREATE POLICY "Users can update their own vault items" 
ON public.vault_items 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own vault items
CREATE POLICY "Users can delete their own vault items" 
ON public.vault_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_vault_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vault_items_timestamp
BEFORE UPDATE ON public.vault_items
FOR EACH ROW
EXECUTE FUNCTION public.update_vault_items_updated_at();

-- Create index for better query performance
CREATE INDEX idx_vault_items_user_id ON public.vault_items(user_id);
CREATE INDEX idx_vault_items_title ON public.vault_items(title);