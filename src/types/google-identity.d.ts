type GoogleCredentialResponse = {
  credential: string;
  select_by: string;
};

type GoogleButtonText =
  | "signin_with"
  | "signup_with"
  | "continue_with";

type GoogleIdentityApi = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: GoogleButtonText;
      shape?: "rectangular" | "pill" | "circle" | "square";
      logo_alignment?: "left" | "center";
      width?: number;
    },
  ) => void;
};

interface Window {
  google?: {
    accounts: {
      id: GoogleIdentityApi;
    };
  };
}
