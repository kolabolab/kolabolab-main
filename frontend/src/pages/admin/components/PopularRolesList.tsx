import React from 'react';
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import type { PopularRole } from '../../../types/analytics';

interface PopularRolesListProps {
  roles: PopularRole[];
}

const PopularRolesList: React.FC<PopularRolesListProps> = ({ roles }) => {
  if (!roles || roles.length === 0) {
    return (
      <Box>
        <Heading size="sm" mb={3}>Popular Roles</Heading>
        <Text color="text-tertiary" fontSize="sm">No role data available</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="sm" mb={3}>Popular Roles</Heading>
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Role</Th>
              <Th isNumeric>Count</Th>
            </Tr>
          </Thead>
          <Tbody>
            {roles.map((role, index) => (
              <Tr key={role.role}>
                <Td>{index + 1}</Td>
                <Td>{role.role}</Td>
                <Td isNumeric>{role.count}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PopularRolesList;
