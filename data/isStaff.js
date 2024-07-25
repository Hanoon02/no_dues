var staffNames = {
    "ahmed21006@iiitd.ac.in": "Ahmed Hanoon",
    "atul@iiitd.ac.in": "Atul Sharma",
    "sanjay@iiitd.ac.in": "Sanjay Roy",
    "vinod@iiitd.ac.in": "Vinod Kumar",
    "ajay@iiitd.ac.in": "Ajay Kumar",
    "rajendra@iiitd.ac.in": "Rajendra Singh",
    "kapil@iiitd.ac.in": "Kapil Chawla",
    "rahul@iiitd.ac.in": "Rahul Gupta",
    "anurag@iiitd.ac.in": "Anurag Tyagi",
    "umesh@iiitd.ac.in": "Umesh",
    "anshu@iiitd.ac.in": "Anshu Dureja",
    "ravi@iiitd.ac.in": "Ravi Bhasin",
    "ankit@iiitd.ac.in": "Ankit Agarwal",
    "abhinay@iiitd.ac.in": "Abhinay Saxena",
    "nayana@iiitd.ac.in": "Nayana Samuel",
    "gursevak@iiitd.ac.in": "Gursevak Singh",
    "nidhi@iiitd.ac.in": "Nidhi Yadav",
    "pallavi@iiitd.ac.in": "Pallavi Kaushik",
    "nisha@iiitd.ac.in": "Nisha Narwal",
    "prachi@iiitd.ac.in": "Prachi Mukherjee",
    "sana@iiitd.ac.in": "Sana Ali Naqvi",
    "khagendra@iiitd.ac.in": "Khagendra Joshi",
    "abhijeet@iiitd.ac.in": "Abhijeet Mishra",
    "adarsh@iiitd.ac.in": "Adarsh Kumar Agarwal",
    "bhawani@iiitd.ac.in": "Bhawani Shah",
    "alok@iiitd.ac.in": "Alok Nikhil Jha",
    "khushpinder@iiitd.ac.in": "Khushpinder Pal Sharma",
    "yogesh@iiitd.ac.in": "Yogesh",
    "sanjna@iiitd.ac.in": "Sanjna Khosla",
    "pritip@iiitd.ac.in": "Priti Patwal",
    "shipra@iiitd.ac.in": "Shipra Jain",
    "ravi@iiitd.ac.in": "Risha Dcruz",  // Note: Duplicate entry with different name
    "rashmil@iiitd.ac.in": "Rashmil Mishra",
    "rahulv@iiitd.ac.in": "Rahul Verma",
    "sanjna@iiitd.ac.in": "Sanjay Chauhan",  // Note: Duplicate email with different name
    "priya@iiitd.ac.in": "Priya Khandelwal",
    "abhishek@iiitd.ac.in": "Abhishek Kumar",
    "sonal@iiitd.ac.in": "Sonal Garg",
    "imran@iiitd.ac.in": "Imran Khan",
    "nilesh@iiitd.ac.in": "Nilesh Kumar Dixit",
    "deepali@iiitd.ac.in": "Deepali Gupta",
    "kapildev@iiitd.ac.in": "Kapil Dev Garg",
    "varsha@iiitd.ac.in": "Varsha",
    "harsh@iiitd.ac.in": "Harsh Gupta",
    "sudhanshut@iiitd.ac.in": "Sudhanshu Tamta",
    "jagadanand@iiitd.ac.in": "Jagadanand Dwivedi",
    "tapan@iiitd.ac.in": "Tapan Kumar",
    "shishir@iiitd.ac.in": "Shishir Jain",
    "binu@iiitd.ac.in": "Binu Ann Joseph",
    "mohit@iiitd.ac.in": "Mohit Kumar",
    "raju@iiitd.ac.in": "Raju Biswas",
    "aakash@iiitd.ac.in": "Aakash Gupta",
    "ashisha@iiitd.ac.in": "Ashish Aggarwal",
    "parikshita@iiitd.ac.in": "Parikshita Behera",
    "sarika@iiitd.ac.in": "Sarika",
    "rubina@iiitd.ac.in": "Rubina Thakur",
    "adeelasughra@gmail.com": "Adeela Sughra",
    "ashutosh@iiitd.ac.in": "Ashutosh Brahma",
    "deepika@iiitd.ac.in": "Deepika Bhaskar",
    "sanjanas@iiitd.ac.in": "Sanjana Soni",
    "akanksha@iiitd.ac.in": "Akanksha",
    "deepak@iiitd.ac.in": "Deepak",
    "uma@iiitd.ac.in": "Uma Shankar Prasad"
};

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
