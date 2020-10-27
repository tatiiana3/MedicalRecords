require('chromedriver');
require('../app');
const chai = require('chai');
const expect = chai.expect;
const {Builder} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const options = new chrome.Options().addArguments(
    'headless'
);
const {
    IDMAP,
    getElementById,
    setupTable,
    validateTableData,
    clickElement,
    getRandomUser
} = require('./utils');
let driver;


describe('patient medical records test', function () {
    this.timeout(100000);

    before(function (done) {
        driver = new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        driver.get('http://localhost:8001')
            .then(() => {
                done();
            });
    });

    after(function () {
        driver.quit();
    });


    beforeEach(async function () {
        driver.navigate().refresh();
    });

    it('Should render the filter view initially', async function () {
        let filterView = await getElementById(driver, IDMAP.FILTER_VIEW);
        expect(await filterView.isDisplayed()).to.be.true;
        let profileView = await getElementById(driver, IDMAP.PROFILE_VIEW);
        expect(await profileView.isDisplayed()).to.be.false;
        let loaderView = await getElementById(driver, IDMAP.LOADER_VIEW);
        expect(await loaderView.isDisplayed()).to.be.false;
    });

    it('Should not start fetching the data if the disabled value is selected in the select menu', async function () {
        let loaderView = await getElementById(driver, IDMAP.LOADER_VIEW);
        expect(await loaderView.isDisplayed()).to.be.false;

        let submitBtn = await getElementById(driver, IDMAP.SUBMIT_BUTTON);
        await clickElement(submitBtn);

        expect(await loaderView.isDisplayed()).to.be.false;
    });

    it('Should show the loader when a valid value is selected from the select dropdown', async function () {
        let selectDropdown = await getElementById(driver, IDMAP.PATIENT_SELECT);
        await selectDropdown.sendKeys(getRandomUser());

        let profileView = await getElementById(driver, IDMAP.PROFILE_VIEW);
        expect(await profileView.isDisplayed()).to.be.false;

        let submitBtn = await getElementById(driver, IDMAP.SUBMIT_BUTTON);
        await clickElement(submitBtn);

        let loaderView = await getElementById(driver, IDMAP.LOADER_VIEW);
        expect(await loaderView.isDisplayed()).to.be.true;

    });

    it('Should render the profile view with user data when the data is fetched', async function () {
        const {records} = await setupTable(driver);

        const patientName = await getElementById(driver, IDMAP.PATIENT_NAME);
        expect(await patientName.getText()).to.eql(records[0].userName);

        const patientDob = await getElementById(driver, IDMAP.PATIENT_DOB);
        expect(await patientDob.getText()).to.eql(`DOB: ${records[0].userDob}`);

        const patientHeight = await getElementById(driver, IDMAP.PATIENT_HEIGHT);
        expect(await patientHeight.getText()).to.eql(`Height: ${records[0].meta.height}`);
    });

    it('Should render the table data correctly when the data is fetched', async function () {
        const {records} = await setupTable(driver);
        await validateTableData(driver, records);
    });

    it('Should fetch and render table data when the selected patient changes', async function () {
        let result = await setupTable(driver);
        await validateTableData(driver, result.records);

        result = await setupTable(driver);
        await validateTableData(driver, result.records);

        result = await setupTable(driver);
        await validateTableData(driver, result.records);
    });
});
