// import React, { useState, useEffect } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Checkbox,
//   Box,
//   Typography,
//   CircularProgress,
// } from '@mui/material';
// import {
//   TimeSlot,
//   Day,
//   AvailabilityData,
//   createDefaultAvailability,
// } from '@/contexts/AuthProvider';

// const timeSlots: TimeSlot[] = [
//   '12am-6am',
//   '6am-9am',
//   '9am-12pm',
//   '12pm-3pm',
//   '3pm-6pm',
//   '6pm-9pm',
//   '9pm-12am',
// ];

// const daysOfWeek: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// interface AvailabilityGridProps {
//   initialValue?: AvailabilityData | null;
//   onAvailabilityChange: (newAvailability: AvailabilityData) => void;
// }

// const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
//   initialValue = null,
//   onAvailabilityChange,
// }) => {
//   const [availability, setAvailability] = useState<AvailabilityData | null>(
//     null
//   );
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Simulate async initialization
//     const initializeAvailability = async () => {
//       try {
//         // If initialValue is null, use the default availability
//         const initialAvailability = initialValue || createDefaultAvailability();
//         setAvailability(initialAvailability);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error initializing availability:', error);
//         setLoading(false);
//       }
//     };

//     initializeAvailability();
//   }, [initialValue]);

//   const handleChange = (day: Day, timeSlot: TimeSlot) => {
//     if (availability) {
//       const newAvailability: AvailabilityData = {
//         ...availability,
//         [day]: {
//           ...availability[day],
//           [timeSlot]: !availability[day][timeSlot],
//         },
//       };
//       setAvailability(newAvailability);
//       onAvailabilityChange(newAvailability);
//     }
//   };

//   if (loading) {
//     return (
//       <Box display='flex' alignItems='center'>
//         <CircularProgress size={20} />
//         <Typography ml={1}>Initializing availability...</Typography>
//       </Box>
//     );
//   }

//   if (!availability) {
//     return <Typography>Error loading availability data.</Typography>;
//   }

//   return (
//     <TableContainer>
//       <Table size='small'>
//         <TableHead>
//           <TableRow>
//             <TableCell>Time Slot</TableCell>
//             {daysOfWeek.map((day) => (
//               <TableCell key={day} align='center'>
//                 {day}
//               </TableCell>
//             ))}
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {timeSlots.map((timeSlot) => (
//             <TableRow key={timeSlot}>
//               <TableCell component='th' scope='row'>
//                 {timeSlot}
//               </TableCell>
//               {daysOfWeek.map((day) => (
//                 <TableCell key={`${day}-${timeSlot}`} align='center'>
//                   <Checkbox
//                     checked={availability[day][timeSlot]}
//                     onChange={() => handleChange(day, timeSlot)}
//                     color='primary'
//                   />
//                 </TableCell>
//               ))}
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// export default AvailabilityGrid;
