const API_URL = 'https://jsonmock.hackerrank.com';
const {By, until} = require('selenium-webdriver');
const axios = require('axios');
const chai = require('chai');
const expect = chai.expect;
const Promise = require("bluebird");


const IDMAP = {
    FILTER_VIEW: 'patient-filter',
    PATIENT_SELECT: 'patient-select',
    PROFILE_VIEW: 'profile-view',
    LOADER_VIEW: 'loader-view',
    PATIENT_NAME: 'patient-name',
    PATIENT_DOB: 'patient-dob',
    PATIENT_HEIGHT: 'patient-height',
    PATIENT_TABLE: 'patient-records-table',
    TABLE_HEADER: 'table-header',
    TABLE_BODY: 'table-body',
    SUBMIT_BUTTON: 'submit-btn'
};

const getElementById = (driver, id) => {
    return driver.findElement(By.id(id))
};

const getElementsByClassName = (driver, className) => {
    return driver.findElements(By.className(className))
};

const getElementsByTagName = (driver, tagName) => {
    return driver.findElements(By.tagName(tagName))
};

const elementHasClass = async (element, className) => {
    const classString = await element.getAttribute("class");
    return classString.split(" ").includes(className)
};

const fetchRecords = (userId) => {
    return new Promise(((resolve, reject) => {
        axios(`${API_URL}/api/medical_records?userId=${userId}`)
            .then(response => {
                resolve(response.data.data)
            })
            .catch(reject);
    }))
};

const clickElement = (node) => {
    try {
        return node.click();
    } catch (e) {
        if (e.name === 'StaleElementReferenceError') {
            return clickElement(node);
        }
        throw e;
    }
};

const setupTable = async (driver) => {
    const userName = getRandomUser();
    let selectDropdown = await getElementById(driver, IDMAP.PATIENT_SELECT);
    await selectDropdown.sendKeys(userName);

    let submitBtn = await getElementById(driver, IDMAP.SUBMIT_BUTTON);
    await clickElement(submitBtn);

    let loaderView = await getElementById(driver, IDMAP.LOADER_VIEW);
    expect(await loaderView.isDisplayed()).to.be.true;

    let records = await fetchRecords(parseInt(await selectDropdown.getAttribute('value')));
    expect(await loaderView.isDisplayed()).to.be.false;

    let profileView = await getElementById(driver, IDMAP.PROFILE_VIEW);
    expect(await profileView.isDisplayed()).to.be.true;

    records = records.sort((a, b) => {
        return b.timestamp - a.timestamp;
    });

    return {records}
};

const validateTableData = async (driver, records) => {
    const tableHeader = await getElementById(driver, IDMAP.TABLE_HEADER);
    const headerColumns = await tableHeader.findElements(By.tagName('th'));

    expect(await headerColumns.length).to.eq(headers.length);

    await Promise.map(headerColumns, async (column, index) => {
        expect(await column.getText()).to.eq(headers[index])
    });

    const tableBody = await getElementById(driver, IDMAP.TABLE_BODY);
    const bodyRows = await tableBody.findElements(By.tagName('tr'));
    expect(bodyRows.length).to.eq(records.length);

    await Promise.map(bodyRows, async (row, rowIndex) => {
        const dataColumns = await row.findElements(By.tagName('td'));
        expect(dataColumns.length).to.eq(headers.length);
        await Promise.map(dataColumns, async (column, colIndex) => {
            let matcher;
            switch (colIndex) {
                case 0:
                    matcher = (rowIndex + 1).toString();
                    break;

                case 1:
                    matcher = getFormattedDate(records[rowIndex].timestamp);
                    break;

                case 2:
                    matcher = `${records[rowIndex].diagnosis.name}(${records[rowIndex].diagnosis.id})`;
                    break;

                case 3:
                    matcher = (records[rowIndex].meta.weight).toString();
                    break;

                case 4:
                    matcher = records[rowIndex].doctor.name;
                    break;
            }
            expect(await column.getText()).to.eq(matcher);
        })
    })
};

const getFormattedDate = (timestamp) => {
    const date = new Date(timestamp);
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    const yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return dd + '/' + mm + '/' + yyyy;
};


const headers = ['SL', 'Date', 'Diagnosis', 'Weight', 'Doctor'];

const getRandomUser = () => {
    const users = ['John Oliver', 'Bob Martin', 'Helena Fernandez', 'Francesco De Mello'];
    return users[Math.floor(Math.random() * (0 - 3 + 1) + 3)];
};


module.exports = {
    getElementById,
    getElementsByClassName,
    fetchRecords,
    setupTable,
    IDMAP,
    getFormattedDate,
    validateTableData,
    headers,
    elementHasClass,
    clickElement,
    getRandomUser
};
