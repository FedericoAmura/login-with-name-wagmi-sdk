const useNavigation = () => {
  const navigate = (path: string) => {
    window.location.href = path;
  }

  const goToRoot = () => {
    navigate("/");
  }

  const goToLitId = () => {
    navigate("/litid");
  }

  const goToRegister = () => {
    navigate("/register");
  }

  const goToHome = () => {
    navigate("/home");
  }

  return {
    goToRoot,
    goToLitId,
    goToRegister,
    goToHome,
  };
}

export default useNavigation;
