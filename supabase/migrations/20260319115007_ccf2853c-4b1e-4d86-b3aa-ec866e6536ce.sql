REVOKE EXECUTE ON FUNCTION public.match_documents(extensions.vector, int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_documents(extensions.vector, int) TO service_role;