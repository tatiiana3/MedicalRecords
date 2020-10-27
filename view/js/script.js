const headers = ['SL', 'Date', 'Diagnosis', 'Weight', 'Doctor'];

const displayBasicInfo =  (data) => {
    console.log(data[0])
    document.getElementById('patient-name').innerHTML = `${data[0].userName}`; 
    document.getElementById('patient-dob').innerHTML = `DOB: ${data[0].userDob}`; 
    document.getElementById('patient-height').innerHTML = `Heigth: ${data[0].meta.height}`; 


}

const createHeader = (headers) => {
    let thead = document.getElementById('table-header')
    let tr = document.createElement('tr')
    thead.appendChild(tr)
    headers.forEach(header => {
        let th = document.createElement('th')
        tr.appendChild(th)
        th.innerHTML = header
        th.setAttribute("id", `${header}`);
        console.log(th)
    })

}

const changeTimeToDate = (timestamp) => {
    let date = new Date(timestamp * 1000)
    let month = date.getMonth()+1
    let day = date.getDate()
    let year = date.getFullYear()
    return `${day}/${month}/${year}`
}

const displayRows = (data) => {
    let tbody = document.getElementById("table-body")
    for(let i = 0; i < data.length; i++){
        let row = data[i]
        currRow = tbody.insertRow(i)
        let sL = currRow.insertCell(0)
        sL.innerHTML = i
        let date = currRow.insertCell(1)
        date.innerHTML = changeTimeToDate(row.timestamp)
        let diagnosis = currRow.insertCell(2)
        diagnosis.innerHTML = `${row.diagnosis.name}(${row.diagnosis.severity})`
        let weight = currRow.insertCell(3)
        weight.innerHTML = row.meta.weight
        let doctor = currRow.insertCell(4)
        doctor.innerHTML = row.doctor.name


    }
}


if (typeof process === "undefined") {

    const search = document.getElementById("submit-btn")

    search.addEventListener("click", event => {
        event.preventDefault()
        const patient = document.getElementById('patient-select')
        const currPatient = patient.selectedIndex
        if(currPatient !== 0){
            const getPatientInfo = async (patientId) => {
                document.getElementById('loader-view-none').id = 'loader-view'; 
                const response = await fetch(`https://jsonmock.hackerrank.com/api/medical_records?${patientId}`)
                const {data} = await response.json()
                document.getElementById('loader-view').id = 'loader-view-none'; 
                displayBasicInfo(data)
                createHeader(headers)
                displayRows(data)

            }
            getPatientInfo(currPatient)

        }
    })
}