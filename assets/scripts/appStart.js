// appstart initialization
const appStart = () => {
    ppLoading();
};

function ppLoading() {
    visLoadingScreen();
    const data = hentFraLocalStorage("homepageData");
    evaluateData(data, "homepage");
}
