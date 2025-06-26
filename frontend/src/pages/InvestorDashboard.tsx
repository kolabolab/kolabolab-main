import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  Badge,
  Avatar,
  useColorModeValue,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from '@chakra-ui/react'
import { FaChartLine, FaEye, FaThumbsUp } from 'react-icons/fa'

const InvestorDashboard = () => {
  const cardBg = useColorModeValue('white', 'gray.800')

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Investor Dashboard
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            Discover and invest in promising startups
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Active Investments</StatLabel>
                <StatNumber>8</StatNumber>
                <StatHelpText>Portfolio companies</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Total Invested</StatLabel>
                <StatNumber>$2.5M</StatNumber>
                <StatHelpText>Across 8 startups</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Pipeline</StatLabel>
                <StatNumber>23</StatNumber>
                <StatHelpText>Under review</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card bg={cardBg}>
          <CardBody>
            <VStack align="start" spacing={4}>
              <Heading size="md">Investment Opportunities</Heading>
              
              {[1, 2, 3].map((i) => (
                <Box key={i} w="full">
                  <HStack justify="space-between" align="start">
                    <HStack>
                      <Avatar size="md" name={`Startup ${i}`} bg="brand.500" />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">TechStartup {i}</Text>
                        <Text fontSize="sm" color="gray.500">
                          AI-powered fintech solution
                        </Text>
                        <HStack>
                          <Badge colorScheme="blue">Seed</Badge>
                          <Badge colorScheme="green">$500K</Badge>
                        </HStack>
                      </VStack>
                    </HStack>
                    <VStack>
                      <Button size="sm" colorScheme="brand">
                        <Icon as={FaEye} mr={2} />
                        Review
                      </Button>
                      <Button size="sm" variant="outline">
                        <Icon as={FaThumbsUp} mr={2} />
                        Interest
                      </Button>
                    </VStack>
                  </HStack>
                  {i < 3 && <Divider mt={4} />}
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default InvestorDashboard