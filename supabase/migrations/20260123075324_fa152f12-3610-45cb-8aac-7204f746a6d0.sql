-- Add explicit deny policies for unauthenticated users on sensitive tables
-- These policies ensure that auth.uid() IS NOT NULL for all operations

-- PROFILES TABLE: Require authentication for all operations
CREATE POLICY "Require authentication for profiles access"
ON public.profiles
FOR ALL
USING (auth.uid() IS NOT NULL);

-- CONTACT_SUBMISSIONS TABLE: Require authentication (admins only can already view, but need auth check)
CREATE POLICY "Require authentication for contact_submissions"
ON public.contact_submissions
FOR SELECT
USING (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'));

-- DONATIONS TABLE: Require authentication for viewing
CREATE POLICY "Require authentication for donations access"
ON public.donations
FOR ALL
USING (auth.uid() IS NOT NULL);

-- AID_REQUESTS TABLE: Require authentication for all operations
CREATE POLICY "Require authentication for aid_requests access"
ON public.aid_requests
FOR ALL
USING (auth.uid() IS NOT NULL);

-- NEWSLETTER_SUBSCRIBERS TABLE: Require authentication for viewing (admins only)
CREATE POLICY "Require authentication for newsletter_subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'));