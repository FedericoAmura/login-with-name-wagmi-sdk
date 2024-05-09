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

  const goToRegisterName = () => {
    navigate("/registerName");
  }

  const goToRegisterAuthFlows = () => {
    navigate("/registerAuthFlows");
  }

  const goToHome = () => {
    navigate("/home");
  }

  return {
    goToRoot,
    goToDomainWallet,
    goToRegisterName,
    goToRegisterAuthFlows,
    goToHome,
  };
}

export default useNavigation;
