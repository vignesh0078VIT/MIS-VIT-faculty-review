import { Faculty, Review, User, NewFacultySuggestion, ChatMessage, QuestionPaper } from '../types';
// Fix: Import firebase from compat to use the Timestamp class.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

// Source data transcribed from the user's images, with gender estimation for avatars
const facultySourceData = [
    { name: 'GITANJALI J', likes: 26, dislikes: 14, reviews: ["Very chill faculty,no pressure on attendance,but checking is unpredictable", "Chill faculty but gives less marks in DAs.", "very good faculty maintains class average teaches well"], isFemale: true },
    { name: 'SUMATHY S', likes: 122, dislikes: 3, reviews: ["She is best,helpful you will definitely enjoy classes", "bestest , very intellectual and helpful", "very good faculty teaches very well easy with projects gives good marks", "Very good"], isFemale: true },
    { name: 'JEYANTHI N', likes: 13, dislikes: 0, reviews: ["nice faculty", "very Good Fac teaches very well with examples maintains class average"], isFemale: true },
    { name: 'VANMATHI C', likes: 16, dislikes: 1, reviews: ["sabke 40+ aayenge,class main aao,soa jao koi dikkat nahi,she is very polite,class avg high hoga bas", "Very chill faculty, gives marks even for wrong answers.", "very chill fac gives marks"], isFemale: true },
    { name: 'VIJAY ANAND R', likes: 15, dislikes: 1, reviews: ["very intellectual and gives good marks and okayish by nature", "great faculty", "good fac needs specific answers", "Amazing faculty, he teaches extremely well. Rarely would you find a teacher who explains the most boring concepts so well. He gives good marks as well, and you can increase it if you ask for more."], isFemale: false },
    { name: 'MALATHY E', likes: 12, dislikes: 1, reviews: ["very nice faculty,no tension in reviews and good marking", "Very good faculty and she is very friendly and gives good marks."], isFemale: true },
    { name: 'NEELU KHARE', likes: 4, dislikes: 28, reviews: ["little bit strict in review else everything is ok,gives good no", "good faculty little strict in projects average in marking"], isFemale: true },
    { name: 'JAGADEESH G', likes: 15, dislikes: 3, reviews: ["goat faculty hai bas lele isko review ki bhi zarurat nahi hai.haan bas s nahi aayega par a zarur aayega", "Very chill teacher and is good in every aspect.", "chillest faculty teaches good gives marks"], isFemale: false },
    { name: 'MANGAYARKARASI R', likes: 8, dislikes: 0, reviews: ["ok faculty hai,no tension lele", "good faculty,lenient only", "teaches well good faculty gives marks"], isFemale: true },
    { name: 'JAYALAKSHMI P', likes: 7, dislikes: 0, reviews: ["acchi hai,teaches nice and dedicately", "very good fac teaches very well gives nice marks to all"], isFemale: true },
    { name: 'SRINIVASAN P', likes: 4, dislikes: 0, reviews: ["goat,superchill koi dikaat nahi reviews assignments sab sahi hai isko lene ke baad", "Good faculty doesnt stress much in class and projects"], isFemale: false },
    { name: 'VIJAYAN E', likes: 6, dislikes: 1, reviews: ["puri class ko s aaya tha,we had him 1st sem", "Very good faculty teaches very well from scratch every topic gives very good marks for all", "Cool faculty gives marks to everyone.Almost everyone got S"], isFemale: false },
    { name: 'EASWARAMOORTHY', likes: 1, dislikes: 0, reviews: ["acchi faculty hai bas quiz would be difficult", "very good faculty teaches very well gives good marks class average would be high"], isFemale: false },
    { name: 'PRABHU J', likes: 22, dislikes: 7, reviews: ["decent faculty, partial towards seniors, quiz is tough.", "good fac teaches well"], isFemale: false },
    { name: 'RAMYA G', likes: 0, dislikes: 0, reviews: ["no,dont take,very strict in projects"], isFemale: true },
    { name: 'DHARMENDRA SINGH RAJPUT', likes: 1, dislikes: 5, reviews: ["a big no.failed many students,never take him"], isFemale: false },
    { name: 'RAHAMATHUNNISA U', likes: 7, dislikes: 7, reviews: ["okayish", "easy going,lenient", "nice only"], isFemale: true },
    { name: 'ARUN N', likes: 1, dislikes: 4, reviews: ["good faculty go for him"], isFemale: false },
    { name: 'RAMKUMAR T', likes: 2, dislikes: 0, reviews: ["he is very nice and helpful but wants good project,i mean he wont cut marks but still ask you to improve and bring better projects,overall he is a nice guy"], isFemale: false },
    { name: 'SATHIYAMOORTHY E', likes: 5, dislikes: 1, reviews: ["mast hai ekdam", "very chill take him"], isFemale: false },
    { name: 'FELICITA S A M', likes: 1, dislikes: 0, reviews: ["dont take,cut marks"], isFemale: true },
    { name: 'HARI RAM VISHWAKARMA', likes: 6, dislikes: 4, reviews: ["25 lowest 27 highest in cats and 4 in review 1.", "bhyi projects main he will make u die and always gives marks just below 30s and wants just 1 page answer for each question", "average marks will 25-26 at highest will be 28 but can score A grade in his subjects"], isFemale: false },
    { name: 'ANBARASA KUMAR A', likes: 12, dislikes: 2, reviews: ["mast hai ekdam"], isFemale: false },
    { name: 'ARIVUSELVAN K', likes: 107, dislikes: 0, reviews: ["goat hai ekdam,teaches super well", "Good Faculty for OS teaches very well Gives assignment for every week lab and marks accordingly"], isFemale: false },
    { name: 'KAMALAKANNAN J', likes: 51, dislikes: 0, reviews: ["best", "nice faculty", "great guy"], isFemale: false },
    { name: 'SREE DHARINYA S', likes: 13, dislikes: 2, reviews: ["strict checking wants perfect answer and quite difficult quiz but she is polite", "good faculty but expects too much in answer sheet maintains class average"], isFemale: true },
    { name: 'ASIS KUMAR TRIPATHY', likes: 6, dislikes: 10, reviews: ["nice faculty", "great"], isFemale: false },
    { name: 'SENTHIL KUMAR P', likes: 4, dislikes: 1, reviews: ["good only"], isFemale: false },
    { name: 'UMA MAHESWARI G', likes: 2, dislikes: 4, reviews: ["very nice maam,and polite also"], isFemale: true },
    { name: 'CHANDRASEGAR.T', likes: 6, dislikes: 0, reviews: ["goat,very chillll", "best faculty and teaches subject very well", "very good faculty no stress in his classes very chill with subject and projects"], isFemale: false },
    { name: 'SWETA BHATTACHARYA', likes: 7, dislikes: 1, reviews: ["good"], isFemale: true },
    { name: 'MALATHI M', likes: 0, dislikes: 0, reviews: ["good"], isFemale: true },
    { name: 'THANDEESWARAN R', likes: 0, dislikes: 0, reviews: ["teaches basic but his question paper is very difficult"], isFemale: false },
    { name: 'NAVANEETHAN C', likes: 4, dislikes: 68, reviews: ["mad guy,because of him i couldnt able to give my nptel exam,he thinks he is very intelligent and brags a lot but he is just an arrogant faculty,rod"], isFemale: false },
    { name: 'JOTHISH KUMAR M', likes: 14, dislikes: 11, reviews: ["very chilll"], isFemale: false },
    { name: 'NAGALAKSHMI VALLABHANENI', likes: 2, dislikes: 4, reviews: ["chilll"], isFemale: true },
    { name: 'SIVA RAMA KRISHNAN S', likes: 9, dislikes: 0, reviews: ["unpredictible,avoid him,will give 0 if he dont find keywords in answers and people really dont like him"], isFemale: false },
    { name: 'JAGANNATHAN J', likes: 5, dislikes: 13, reviews: ["not good"], isFemale: false },
    { name: 'NANCY VICTOR', likes: 5, dislikes: 7, reviews: ["good"], isFemale: true },
    { name: 'HARSHITA PATEL', likes: 0, dislikes: 0, reviews: ["a big no"], isFemale: true },
    { name: 'VANI MP', likes: 2, dislikes: 7, reviews: ["good faculty"], isFemale: true },
    { name: 'PRIYA M', likes: 10, dislikes: 4, reviews: ["take less credits but never take her"], isFemale: true },
    { name: 'SREEHARI E', likes: 0, dislikes: 2, reviews: ["chill"], isFemale: false },
    { name: 'RANICHANDRA C', likes: 3, dislikes: 1, reviews: ["nice", "teaches very well all topics easy with subject gives good marks"], isFemale: true },
    { name: 'PRADEEPA M', likes: 9, dislikes: 2, reviews: ["good", "Very chill teacher and gives good marks"], isFemale: true },
    { name: 'PRABHANANTHA KUMAR M', likes: 1, dislikes: 0, reviews: ["a big no"], isFemale: false },
    { name: 'USHAPREETHI P', likes: 3, dislikes: 0, reviews: ["nice", "good"], isFemale: true },
    { name: 'KUMARESAN P', likes: 14, dislikes: 2, reviews: ["nice"], isFemale: false },
    { name: 'SENTHIL KUMARANU', likes: 6, dislikes: 0, reviews: ["nice but dont take if he is teaching design pattern", "good fac but a little strict in class maintains class average"], isFemale: false },
    { name: 'JAYALASHMI M', likes: 0, dislikes: 1, reviews: ["worst and wont give attendance"], isFemale: true },
    { name: 'KALAIVANI K', likes: 2, dislikes: 6, reviews: ["very nice faculty"], isFemale: true },
    { name: 'SUMAIYA THASEEN I', likes: 1, dislikes: 1, reviews: ["she sets hard lab assignments, fair marking"], isFemale: true },
    { name: 'SUBRAMANYAM REDDY', likes: 3, dislikes: 1, reviews: ["good"], isFemale: false },
    { name: 'GUNDALA SWATHI', likes: 2, dislikes: 0, reviews: ["nice only"], isFemale: true },
    { name: 'BALAJI E', likes: 14, dislikes: 0, reviews: ["Lenient and friendly", "very good fac very chill no stress"], isFemale: false },
    { name: 'PRABHADEVI', likes: 12, dislikes: 2, reviews: ["Best faculty, genuine, not partial, teaches well"], isFemale: true },
    { name: 'SUDHA M', likes: 1, dislikes: 0, reviews: ["Good faculty, teaches well, does linient marking"], isFemale: true },
    { name: 'SUGANYA P', likes: 11, dislikes: 7, reviews: ["Partial towards boys. She won't entertain you after a certain point of your semester. People say she is the best I say she is the worst. Don'take her."], isFemale: true },
    { name: 'SENTHIL MURUGAN B', likes: 4, dislikes: 0, reviews: ["Worst worst worst teacher ... Galti se bhi mat Lena ...drop that course but don't take that faculty..will give u a 7/15 in your assessments very harsh spoken. Will make you sit roll no wise, phones not allowed inside labs and a lot of stuff which is unbearable and torturous"], isFemale: false },
    { name: 'NAVANEETHAN', likes: 0, dislikes: 1, reviews: ["Strict faculty, quiz will be hard, will give good marks in CATS."], isFemale: false },
    { name: 'NADESH R K', likes: 3, dislikes: 0, reviews: ["Strict faculty and gives less marks"], isFemale: false },
    { name: 'BHAVANI S', likes: 2, dislikes: 1, reviews: ["Strict faculty, in CATs you need to write exact answer as given in ppt or else she will not give marks.", "Very strict,passed with c grade,had to study so many things and she wants exact ppt lines and is tough to remember each Line of such a big subject"], isFemale: true },
    { name: 'THANGA MARIAPPAN L', likes: 5, dislikes: 2, reviews: ["chill faculty, gives marks easily"], isFemale: false },
    { name: 'GAURAV SUSHANT', likes: 0, dislikes: 0, reviews: ["good at teaching and makes it easier to understand"], isFemale: false },
    { name: 'SANTHOSH KUMAR S V N', likes: 11, dislikes: 2, reviews: ["gives marks and no stress for projects"], isFemale: false },
    { name: 'SUMANGALI K', likes: 0, dislikes: 0, reviews: ["good faculty gives marks easily"], isFemale: true },
    { name: 'RAJESH KALURI', likes: 7, dislikes: 9, reviews: ["little specific in his projects rest he is good at teaching and will get A grade easily"], isFemale: false },
    { name: 'SANTHI K', likes: 3, dislikes: 0, reviews: ["chill faculty"], isFemale: true },
    { name: 'MEENATCHI S', likes: 2, dislikes: 0, reviews: ["good at teaching"], isFemale: true },
    { name: 'POUNAMBAL M', likes: 7, dislikes: 4, reviews: ["do not take her", "teaches very well but doesnt trust students for their assignments students have to present all the assigments as demo in front of her then only you will get marks ornot zero"], isFemale: true },
    { name: 'KRISHNA CHANDAR N', likes: 0, dislikes: 0, reviews: ["chill"], isFemale: false },
    { name: 'SRINIVAS KOPPU', likes: 2, dislikes: 0, reviews: ["chill"], isFemale: false },
    { name: 'DEEPA N', likes: 8, dislikes: 2, reviews: ["good faculty", "Worst faculty. Only give marks to tamit"], isFemale: true },
    { name: 'BALAKRISHNAN S', likes: 3, dislikes: 0, reviews: ["best faculty teaches very well"], isFemale: false },
    { name: 'SEETHA R', likes: 0, dislikes: 2, reviews: ["chill faculty", "teaches every topic very well good at marking"], isFemale: true },
    { name: 'U.VIJAYALAKSHMI', likes: 1, dislikes: 0, reviews: ["Very good faculty. Gives good marks and teaches well"], isFemale: true },
    { name: 'KARPAGAM S', likes: 0, dislikes: 0, reviews: ["OK faculty. Little strict in class"], isFemale: true },
    { name: 'ANAND PRABHU A', likes: 1, dislikes: 0, reviews: ["good faculty friendly"], isFemale: false },
    { name: 'RAJU R L N', likes: 0, dislikes: 0, reviews: ["very nice faculty teaches good"], isFemale: false },
    { name: 'UMA K', likes: 3, dislikes: 0, reviews: ["good faculty teaches very well"], isFemale: true },
    { name: 'REENU RANI', likes: 0, dislikes: 0, reviews: ["good faculty teaching not so ok but can get good marks if u study by yourself"], isFemale: true },
    { name: 'KURGANTI VASU', likes: 0, dislikes: 0, reviews: ["very good faculty teaches very well lab is so chill class average is high"], isFemale: false },
    { name: 'SUJATHA V', likes: 0, dislikes: 0, reviews: ["very good faculty gives good marks easy to go"], isFemale: true },
    { name: 'VALARMATHI B', likes: 1, dislikes: 0, reviews: ["Strict faculty Have to be attentive in class"], isFemale: true },
    { name: 'SWARNA PRIYA R M', likes: 1, dislikes: 1, reviews: ["not so good faculty"], isFemale: true },
    { name: 'SENTHIL KUMAR. M', likes: 10, dislikes: 114, reviews: ["very strict faculty have to be very attentive in class very particular about everything he wants"], isFemale: false },
    { name: 'RAGHAVAN R', likes: 6, dislikes: 1, reviews: ["best faculty for TOC gives very good marks and teaches very very well"], isFemale: false },
    { name: 'NIRMALA M', likes: 9, dislikes: 6, reviews: ["very good faculty for java teaches good gives marks lab is slightly difficult"], isFemale: true },
    { name: 'KARTHIKEYAN P', likes: 12, dislikes: 6, reviews: ["teaches very good with examples very good faculty"], isFemale: false },
    { name: 'AGILANDEESWARI L', likes: 0, dislikes: 0, reviews: ["teaches well strict in projects and doesnt give marks in FAT"], isFemale: true },
    { name: 'SENTHILKUMARAN U', likes: 0, dislikes: 0, reviews: ["good fac but a little strict in class maintains class average"], isFemale: false },
    { name: 'PRABHUKUMAR M', likes: 19, dislikes: 13, reviews: ["teaches the subject well but very strict in corrections and projects"], isFemale: false },
    { name: 'THANGA MARIAPP', likes: 2, dislikes: 0, reviews: ["Very chill and light faculty"], isFemale: false },
    { name: 'CALAIVANANE R', likes: 0, dislikes: 0, reviews: ["Very good teaching, gives marks according to the performance, descent marks"], isFemale: false },
    { name: 'PRAVEEN T', likes: 5, dislikes: 2, reviews: ["Teaches ok ,little strict", "Okayish"], isFemale: false },
];

const titles = ["Professor", "Assistant Professor", "Associate Professor"];
const tags = ['Helpful', 'Strict', 'Project-Heavy', 'Good Grader', 'Lenient'];

export const dummyFaculties: Faculty[] = facultySourceData.map((f, index) => {
    const totalVotes = f.likes + f.dislikes;
    const rating = totalVotes === 0 ? 0 : (f.likes / totalVotes) * 5;
    
    return {
        id: `faculty-${index + 1}`,
        name: f.name,
        department: 'Computer Science',
        title: titles[index % titles.length],
        bio: `An esteemed member of the Computer Science department, specializing in various fields of computer science.`,
        avatarUrl: `https://api.dicebear.com/8.x/micah/svg?seed=${f.name.replace(/\s/g, '')}`,
        rating: rating,
        reviewCount: f.reviews.length,
        tags: [tags[index % tags.length], tags[(index + 2) % tags.length]],
        likes: f.likes,
        dislikes: f.dislikes,
    };
});

// Create dummy users (students)
export const dummyStudents: User[] = [
    { id: 'student-1', email: 'student1@vitstudent.ac.in', role: 'student', isActive: true, logoutPending: false, forceLogout: false },
    { id: 'student-2', email: 'student2@vitstudent.ac.in', role: 'student', isActive: true, logoutPending: true, forceLogout: false },
    { id: 'student-3', email: 'student3@vitstudent.ac.in', role: 'student', isActive: false, logoutPending: false, forceLogout: false },
];

// Create a dummy admin user
export const dummyAdmin: User = {
    id: 'admin-1',
    // Fix: Updated admin email to user's new preference.
    email: 'vignesh0078@admin.in',
    username: 'VIGNESH0078',
    role: 'admin',
    isActive: true,
    logoutPending: false,
    forceLogout: false,
};

// Create dummy reviews
export const dummyReviews: Review[] = dummyFaculties.flatMap((faculty, facultyIndex) => {
    const sourceFaculty = facultySourceData[facultyIndex];
    return sourceFaculty.reviews.map((comment, reviewIndex) => {
        const studentIndex = (facultyIndex + reviewIndex) % dummyStudents.length;
        const statusOptions: Review['status'][] = ['pending', 'approved', 'approved', 'rejected'];
        const status = statusOptions[(facultyIndex + reviewIndex) % statusOptions.length];

        // Generate a rating based on a hash of the comment to keep it consistent
        const commentHash = comment.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rating = (commentHash % 5) + 1; // Rating between 1 and 5
        
        return {
            id: `review-${faculty.id}-${reviewIndex + 1}`,
            userId: dummyStudents[studentIndex].id,
            facultyId: faculty.id,
            rating: rating,
            comment: comment,
            // Fix: Use the namespaced Timestamp class.
            date: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - (reviewIndex * 1000 * 3600 * 24))), // Stagger dates
            status: status
        };
    });
});


// Create dummy new faculty suggestions
export const dummySuggestions: NewFacultySuggestion[] = [
    {
        id: 'suggestion-1',
        userId: 'student-1',
        facultyName: 'Dr. Alan Turing',
        department: 'Computer Science',
        title: 'Professor Emeritus',
        notes: 'Pioneering work in theoretical computer science.',
        // Fix: Use the namespaced Timestamp class.
        date: firebase.firestore.Timestamp.now(),
        status: 'pending'
    },
    {
        id: 'suggestion-2',
        userId: 'student-2',
        facultyName: 'Dr. Grace Hopper',
        department: 'Computer Science',
        title: 'Visiting Professor',
        notes: 'Invented the first compiler for a computer programming language.',
        // Fix: Use the namespaced Timestamp class.
        date: firebase.firestore.Timestamp.now(),
        status: 'pending'
    }
];

export const dummyChatMessages: ChatMessage[] = [
    {
        id: 'chat-1',
        userId: 'student-1',
        userEmail: 'student1@vitstudent.ac.in',
        text: 'Hey everyone, how is the OS exam prep going?',
        // Fix: Use the namespaced Timestamp class.
        timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 5)),
    },
    {
        id: 'chat-2',
        userId: 'student-2',
        userEmail: 'student2@vitstudent.ac.in',
        text: 'Not great, I am struggling with the scheduling algorithms. Anyone have good notes for Prof. Sumathy S\'s class?',
        // Fix: Use the namespaced Timestamp class.
        timestamp: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 4)),
    },
];

export const dummyQuestionPapers: QuestionPaper[] = [
    {
        id: 'qp-1',
        userId: 'student-1',
        userEmail: 'student1@vitstudent.ac.in',
        courseName: 'Data Structures and Algorithms',
        slot: 'L1+L2',
        imageUrl: 'https://via.placeholder.com/600x800.png?text=DSA+Question+Paper',
        status: 'approved',
        date: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 3600 * 24 * 5)),
    },
    {
        id: 'qp-2',
        userId: 'student-2',
        userEmail: 'student2@vitstudent.ac.in',
        courseName: 'Operating Systems',
        slot: 'L31+L32',
        imageUrl: 'https://via.placeholder.com/600x800.png?text=OS+Question+Paper',
        status: 'approved',
        date: firebase.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 3600 * 24 * 3)),
    },
    {
        id: 'qp-3',
        userId: 'student-3',
        userEmail: 'student3@vitstudent.ac.in',
        courseName: 'Database Management Systems',
        slot: 'L15+L16',
        imageUrl: 'https://via.placeholder.com/600x800.png?text=DBMS+Pending+Paper',
        status: 'pending',
        date: firebase.firestore.Timestamp.now(),
    },
];