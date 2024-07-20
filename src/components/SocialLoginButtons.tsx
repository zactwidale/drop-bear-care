import { Box } from "@mui/material";
import DBCMarkdown from "./DBCMarkdown";
import AppleIcon from "@/assets/icons/apple-logo.svg";
import FacebookIcon from "@/assets/icons/facebook-logo.svg";
import GoogleIcon from "@/assets/icons/google-logo.svg";
import MicrosoftIcon from "@/assets/icons/microsoft-logo.svg";
import SocialLoginButton from "@/components/SocialLoginButtom";

interface SocialLoginButtonsProps {
  disabled?: boolean;
  handleClick: (provider: string) => void;
}

export default function SocialLoginButtons({
  disabled = false,
  handleClick,
}: SocialLoginButtonsProps) {
  return (
    <>
      {" "}
      <DBCMarkdown text={`## Social Logins`} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SocialLoginButton
          title="Log In with Google"
          logo={<GoogleIcon />}
          disabled={disabled}
          onClick={() => handleClick("google")}
        />
        <SocialLoginButton
          title="Log In with Facebook"
          logo={<FacebookIcon />}
          disabled={disabled}
          onClick={() => handleClick("facebook")}
        />
        <SocialLoginButton
          title="Log In with Microsoft"
          logo={<MicrosoftIcon />}
          disabled={disabled}
          onClick={() => handleClick("microsoft")}
        />
        <SocialLoginButton
          title="Log In with Apple"
          logo={<AppleIcon />}
          disabled
          onClick={() => handleClick("apple")}
        />
      </Box>
    </>
  );
}
