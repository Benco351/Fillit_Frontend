import { Box } from "@mui/system";
import ShiftFilters from "../ShiftManagment/ShiftFilters";
import { Dispatch, SetStateAction } from "react";

interface FilterProps {
  filter: 'all' | 'requested' | 'accepted' | 'full';
  setFilter: Dispatch<SetStateAction<'all' | 'requested' | 'accepted' | 'full'>>;
}

const Filter: React.FC<FilterProps> = ({ filter, setFilter }) => {
  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 4,
      }}
    >
      <ShiftFilters filter={filter} setFilter={setFilter} />
    </Box>
  );
};

export default Filter;