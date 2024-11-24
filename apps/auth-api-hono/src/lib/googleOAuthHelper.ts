import { Google } from "arctic";
import { getEnvironmentVariable } from "lib/utils/getEnvironmentVariable";

export const getGoogleOAuthHelper = () => {
	const googleClientId = getEnvironmentVariable("GOOGLE_OAUTH_CLIENT_ID");
	const googleClientSecret = getEnvironmentVariable("GOOGLE_OAUTH_CLIENT_SECRET");
	const googleRedirectUri = getEnvironmentVariable("GOOGLE_OAUTH_REDIRECT_URI");

	return new Google(
		googleClientId,
		googleClientSecret,
		googleRedirectUri
	);
};

