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

  const goToRegisterAuthFlows = (name?: string) => {
    navigate(`/registerAuthFlows${name ? `?name=${name}` : ""}`);
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
