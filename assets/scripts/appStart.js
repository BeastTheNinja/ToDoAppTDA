// appstart initialization  export to main.js
const appStart = () => {
    ppLoading();
};

function ppLoading() {
    visLoadingScreen();
    const data = hentFraLocalStorage("homepageData");
    evaluateData(data, "homepage");
}
