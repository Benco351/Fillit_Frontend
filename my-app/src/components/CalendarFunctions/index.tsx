// Mock employees data - in a real application this would come from an API
import {Employee} from '../../components/CalendarFeatures/calendarStates';
import { format, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns';




export const employees: Employee[] = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  { id: 3, name: 'Bob Johnson' },
];


