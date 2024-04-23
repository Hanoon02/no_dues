var staffNames = {"ahmed21006@iiitd.ac.in":"Hanoon the best staff"}

const getStaffName = (email) => {
    return staffNames[email];
}

module.exports.staffNames = staffNames;

const isStaff = (email) => {
    if (email in staffNames) {
        return true;
    } else {
        return false;
    }
} 
module.exports={getStaffName,isStaff}; 
