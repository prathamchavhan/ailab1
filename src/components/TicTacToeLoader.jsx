
// "use client";

// import { useState, useEffect } from "react";



// /**
//  * Calculates the winner and the winning line.
//  * @param {Array<string|null>} board - The 9 squares of the board.
//  * @returns {object} { winner: 'X', 'O', or null, line: [number, number, number] or [] }
//  */
// function calculateWinner(board) {
//   const lines = [
//     [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
//     [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
//     [0, 4, 8], [2, 4, 6],          // Diagonals
//   ];
//   for (let i = 0; i < lines.length; i++) {
//     const [a, b, c] = lines[i];
//     if (board[a] && board[a] === board[b] && board[a] === board[c]) {
//       return { winner: board[a], line: [a, b, c] };
//     }
//   }
//   return { winner: null, line: [] };
// }

// /**
//  * Finds the best move for the computer (AI).
//  * @param {Array<string|null>} board - The current board state.
//  * @returns {number|null} The index of the best move.
//  */
// function findComputerMove(board) {
//   const player = 'X';
//   const computer = 'O';

//   // 1. Check if Computer can win
//   for (let i = 0; i < 9; i++) {
//     if (!board[i]) {
//       const tempBoard = [...board];
//       tempBoard[i] = computer;
//       if (calculateWinner(tempBoard).winner === computer) {
//         return i;
//       }
//     }
//   }

//   // 2. Check if Player can win (and block)
//   for (let i = 0; i < 9; i++) {
//     if (!board[i]) {
//       const tempBoard = [...board];
//       tempBoard[i] = player;
//       if (calculateWinner(tempBoard).winner === player) {
//         return i;
//       }
//     }
//   }

//   // 3. Take the center if available
//   if (!board[4]) {
//     return 4;
//   }

//   // 4. Take an empty corner
//   const corners = [0, 2, 6, 8];
//   const emptyCorners = corners.filter(i => !board[i]);
//   if (emptyCorners.length > 0) {
//     return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
//   }

//   // 5. Take an empty side
//   const sides = [1, 3, 5, 7];
//   const emptySides = sides.filter(i => !board[i]);
//   if (emptySides.length > 0) {
//     return emptySides[Math.floor(Math.random() * emptySides.length)];
//   }
  
//   return null; // No available moves
// }


// // --- Main Component ---

// export default function TicTacToeLoader() {
//   const [board, setBoard] = useState(Array(9).fill(null));
  
 
//   const [isPlayerTurn, setIsPlayerTurn] = useState(() => Math.random() < 0.5);
  
//   const [gameInfo, setGameInfo] = useState({ winner: null, line: [] });
  
//   const isBoardFull = board.every(Boolean);
//   const isGameOver = gameInfo.winner || isBoardFull;

//   useEffect(() => {
//     if (!isPlayerTurn && !isGameOver) {
//       // Add a small delay for a more "human" feel
//       const timer = setTimeout(() => {
//         const computerMove = findComputerMove(board);
//         if (computerMove !== null) {
//           const newBoard = [...board];
//           newBoard[computerMove] = 'O';
//           setBoard(newBoard);
          
//           const newGameInfo = calculateWinner(newBoard);
//           if (newGameInfo.winner) {
//             setGameInfo(newGameInfo);
//           } else {
//             setIsPlayerTurn(true);
//           }
//         }
//       }, 700); // 0.7 second delay

//       return () => clearTimeout(timer);
//     }
//   }, [isPlayerTurn, board, isGameOver]); // Dependencies are correct

//   // --- Player's Move Handler ---
//   const handlePlayerMove = (index) => {
//     // Allow click only if it's player's turn, the square is empty, and game is not over
//     if (!isPlayerTurn || board[index] || isGameOver) {
//       return;
//     }

//     const newBoard = [...board];
//     newBoard[index] = 'X';
//     setBoard(newBoard);

//     const newGameInfo = calculateWinner(newBoard);
//     if (newGameInfo.winner) {
//       setGameInfo(newGameInfo);
//     } else if (newBoard.every(Boolean)) {
   
//     } else {
//       setIsPlayerTurn(false); // Switch to computer's turn
//     }
//   };

//   // --- Reset Game ---
//   const handleReset = () => {
//     setBoard(Array(9).fill(null));
//     setGameInfo({ winner: null, line: [] });
    
//     // --- MODIFICATION #2: Randomize who starts on reset ---
//     setIsPlayerTurn(Math.random() < 0.5); 
//   };

//   // --- Status Message ---
//   let status;
//   if (gameInfo.winner) {
//     status = gameInfo.winner === 'X' ? "You win!" : "Computer wins!";
//   } else if (isBoardFull) {
//     status = "It's a draw!";
//   } else {
//     status = isPlayerTurn ? "Your Turn (X)" : "Computer's Turn (O)";
//   }

//   // --- Cell Styling ---
//   const getCellClasses = (index) => {
//     let classes = "w-20 h-20 md:w-24 md:h-24 flex items-center justify-center text-5xl font-bold cursor-pointer transition-colors";

//     // Add border styles to create the grid
//     if (index % 3 < 2) classes += " border-r-4"; 
//     if (index < 6) classes += " border-b-4";   
//     classes += " border-teal-500";
    
//     // Style for 'X' and 'O'
//     if (board[index] === 'X') {
//       classes += " text-red-400";
//     } else if (board[index] === 'O') {
//       classes += " text-blue-300";
//     }

//     // Highlight winning cells
//     if (gameInfo.line.includes(index)) {
//       classes += " bg-teal-800";
//     }

//     // Hover effect only for empty, playable cells
//     if (!board[index] && isPlayerTurn && !isGameOver) {
//       classes += " hover:bg-gray-700";
//     } else {
//       classes += " cursor-not-allowed";
//     }

//     return classes;
//   };

//   return (
//     <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
//       <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        
//         {/* Header */}
//         <div className="flex items-center justify-center mb-4">
//           <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
//           <p className="ml-3 text-[15px] font-semibold text-white">
//             Generating... Play a game while you wait!
//           </p>
//         </div>

//         {/* Game Status */}
//         <div className="mb-3 text-center text-xl font-medium text-white">
//           {status}
//         </div>

//         {/* Game Board */}
//         <div className="grid grid-cols-3">
//           {board.map((value, index) => (
//             <div
//               key={index}
//               className={getCellClasses(index)}
//               onClick={() => handlePlayerMove(index)}
//             >
//               {value}
//             </div>
//           ))}
//         </div>

//         {/* Reset Button */}
//         {isGameOver && (
//           <button
//             onClick={handleReset}
//             className="mt-4 w-full py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white !rounded-lg font-semibold hover:opacity-90 transition"
//           >
//             Play Again
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }




// components/MathQuizLoader.jsx
"use client";

import { useState, useEffect } from "react";

// --- Helper Functions ---

/**
 * Generates a new math question suitable for a young adult.
 * @returns {object} { questionText, answer }
 */
function generateQuestion() {
  const questionType = Math.floor(Math.random() * 4) + 1; // 1 to 4
  let questionText, answer;

  switch (questionType) {
    // Type 1: PEMDAS (a + b * c)
    case 1: {
      const a = Math.floor(Math.random() * 10) + 1; // 1-10
      const b = Math.floor(Math.random() * 10) + 2; // 2-10
      const c = Math.floor(Math.random() * 10) + 2; // 2-10
      questionText = `${a} + ${b} * ${c}`;
      answer = a + (b * c);
      break;
    }

    // Type 2: Simple Exponent (a^2 or a^3)
    case 2: {
      const pow = Math.random() < 0.5 ? 2 : 3; // Square or Cube
      let base;
      if (pow === 2) {
        base = Math.floor(Math.random() * 10) + 2; // 2-11
        questionText = `${base}²`; // Using superscript
        answer = base * base;
      } else {
        // Keep cube base smaller
        base = Math.floor(Math.random() * 5) + 2; // 2-6
        questionText = `${base}³`;
        answer = base * base * base;
      }
      break;
    }

    // Type 3: Simple Root (sqrt)
    case 3: {
      const a = Math.floor(Math.random() * 10) + 3; // 3-12
      const val = a * a;
      questionText = `√${val}`; // Using sqrt symbol
      answer = a;
      break;
    }

    // Type 4: Basic Algebra (a * x = b)
    case 4: {
      const x_answer = Math.floor(Math.random() * 10) + 2; // 2-11
      const a = Math.floor(Math.random() * 10) + 2; // 2-11
      const b = a * x_answer;
      questionText = `${a}x = ${b}`;
      answer = x_answer;
      break;
    }
    
    // Default fallback
    default: {
      questionText = `10 + 5`;
      answer = 15;
    }
  }

  return { questionText, answer };
}


// --- Main Component ---

export default function MathQuizLoader() {
  const [question, setQuestion] = useState(generateQuestion());
  const [userAnswer, setUserAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);

  // --- Form Submit Handler ---
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form from refreshing the page

    if (!userAnswer) return; // Don't do anything if input is empty

    const guess = parseInt(userAnswer, 10);

    if (guess === question.answer) {
      setScore(score + 1);
      setMessage("Correct!");
      // After 1 second, clear message and show a new question
      setTimeout(() => {
        setMessage("");
        setQuestion(generateQuestion());
        setUserAnswer("");
      }, 1000);
    } else {
      setMessage("Wrong! Try again.");
      // Clear the wrong answer after 1 second
      setTimeout(() => {
        setMessage("");
        setUserAnswer("");
      }, 1000);
    }
  };

  // --- Input Change Handler ---
  const handleInputChange = (e) => {
    // Allow only numbers (and a negative sign, though not needed for these problems)
    const value = e.target.value.replace(/[^0-9-]/g, '');
    setUserAnswer(value);
  };

  // --- Determine message color ---
  const messageClass = message === "Correct!" 
    ? "text-green-400" 
    : "text-red-400";

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-full max-w-sm">
        
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-[15px] font-semibold text-white">
            Generating... Play a game while you wait!
          </p>
        </div>

        {/* Game UI */}
        <div className="text-center">
          <p className="text-lg text-gray-300 mb-2">
            {/* Context-aware question title */}
            {question.questionText.includes('x') ? "Solve for x:" : "What is:"}
          </p>
          
          {/* Question */}
          <p className="text-4xl font-bold text-white mb-4">
            {question.questionText}
          </p>

          {/* Answer Form */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              inputMode="numeric" // Helps on mobile keyboards
              value={userAnswer}
              onChange={handleInputChange}
              className="w-full px-4 py-2 text-center text-2xl font-medium bg-gray-700 text-white border border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your answer"
              autoFocus
            />
            <button
              type="submit"
              className="mt-4 w-full py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white !rounded-lg font-semibold hover:opacity-90 transition"
            >
              Submit
            </button>
          </form>

          {/* Feedback Message */}
          <p className={`mt-3 text-lg font-medium h-6 ${messageClass}`}>
            {message}
          </p>
          
          {/* Score */}
          <p className="mt-2 text-base text-gray-400">
            Score: {score}
          </p>
        </div>
      </div>
    </div>
  );
}