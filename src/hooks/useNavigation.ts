const useNavigation = () => {
  const navigate = (path: string) => {
    window.location.href = path;
  }

  const goToRoot = () => {
    navigate("/");
  }

  const goToDomainWallet = () => {
    navigate("/domainWallet");
  }

  const goToRegister = () => {
    navigate("/register");
  }

  const goToHome = () => {
    navigate("/home");
  }

  return {
    goToRoot,
    goToDomainWallet,
    goToRegister,
    goToHome,
  };
}

export default useNavigation;
