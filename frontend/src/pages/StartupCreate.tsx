import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Progress,
  Badge,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const StartupCreate = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingStage: '',
    targetMarket: '',
    fundingGoal: '',
    equityOffered: 0,
    timeline: '',
    requiredSkills: '',
    isPublic: true,
    tags: '',
    businessModel: '',
    competitiveAdvantage: '',
    teamSize: 1,
  })
  
  const navigate = useNavigate()
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.800')

  const totalSteps = 3
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Simulate startup creation
    toast({
      title: 'Startup Created Successfully!',
      description: 'Your startup is now live on Kolabolab. Start connecting with collaborators and investors.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
    navigate('/startups')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={2}>Basic Information</Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Tell us about your startup idea and what you're building.
              </Text>
            </Box>
            
            <FormControl isRequired>
              <FormLabel>Startup Name</FormLabel>
              <Input
                placeholder="Enter your startup name"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Describe your startup, what problem it solves, and your solution..."
                rows={5}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Target Market</FormLabel>
              <Input
                placeholder="Who are your target customers?"
                value={formData.targetMarket}
                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Tags</FormLabel>
              <Input
                placeholder="#fintech #ai #sustainability (separate with spaces)"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                Use relevant keywords like #startup #funding #collaboration #opportunity
              </Text>
            </FormControl>
          </VStack>
        )

      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={2}>Funding & Business Model</Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Share details about your funding needs and business approach.
              </Text>
            </Box>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Funding Stage</FormLabel>
                <Select
                  placeholder="Select funding stage"
                  value={formData.fundingStage}
                  onChange={(e) => handleInputChange('fundingStage', e.target.value)}
                >
                  <option value="Idea">Idea Stage</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Funding Goal</FormLabel>
                <Input
                  placeholder="e.g., $500K"
                  value={formData.fundingGoal}
                  onChange={(e) => handleInputChange('fundingGoal', e.target.value)}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Equity Offered (%)</FormLabel>
              <NumberInput
                min={0}
                max={100}
                value={formData.equityOffered}
                onChange={(_, value) => handleInputChange('equityOffered', value)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Business Model</FormLabel>
              <Textarea
                placeholder="How do you plan to make money? Subscription, marketplace, advertising, etc."
                rows={3}
                value={formData.businessModel}
                onChange={(e) => handleInputChange('businessModel', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Competitive Advantage</FormLabel>
              <Textarea
                placeholder="What makes your startup unique? Why will you succeed?"
                rows={3}
                value={formData.competitiveAdvantage}
                onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
              />
            </FormControl>
          </VStack>
        )

      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={2}>Team & Collaboration</Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Let potential collaborators know what you're looking for.
              </Text>
            </Box>

            <FormControl>
              <FormLabel>Current Team Size</FormLabel>
              <NumberInput
                min={1}
                max={100}
                value={formData.teamSize}
                onChange={(_, value) => handleInputChange('teamSize', value)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Required Skills & Roles</FormLabel>
              <Textarea
                placeholder="What skills, expertise, or roles are you looking for? e.g., Full-stack developer, Marketing specialist, UI/UX designer..."
                rows={4}
                value={formData.requiredSkills}
                onChange={(e) => handleInputChange('requiredSkills', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Timeline</FormLabel>
              <Input
                placeholder="Expected development timeline, e.g., 6 months to MVP"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              >
                Make this startup publicly visible
              </Checkbox>
              <Text fontSize="sm" color="gray.500" mt={1}>
                If unchecked, only invited collaborators and verified investors can see your startup
              </Text>
            </FormControl>

            {/* Preview */}
            <Card bg={useColorModeValue('blue.50', 'blue.900')} borderLeft="4px solid" borderColor="blue.500">
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" color="blue.500">Preview</Text>
                  <Text fontWeight="semibold">{formData.title || 'Your Startup Name'}</Text>
                  <Text fontSize="sm" noOfLines={2}>
                    {formData.description || 'Your startup description will appear here...'}
                  </Text>
                  <HStack>
                    {formData.fundingStage && (
                      <Badge colorScheme="blue">{formData.fundingStage}</Badge>
                    )}
                    {formData.fundingGoal && (
                      <Badge colorScheme="green">{formData.fundingGoal}</Badge>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        )

      default:
        return null
    }
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            Create Your Startup
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="lg">
            Share your idea with the Kolabolab community and start building your team
          </Text>
        </Box>

        {/* Progress */}
        <Card bg={cardBg}>
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" fontWeight="semibold">
                  Step {currentStep} of {totalSteps}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {Math.round(progressPercentage)}% Complete
                </Text>
              </HStack>
              <Progress
                value={progressPercentage}
                colorScheme="brand"
                size="lg"
                w="full"
                borderRadius="full"
              />
              <HStack spacing={4} fontSize="sm">
                <Text color={currentStep >= 1 ? 'brand.500' : 'gray.400'}>
                  Basic Info
                </Text>
                <Text color={currentStep >= 2 ? 'brand.500' : 'gray.400'}>
                  Funding & Business
                </Text>
                <Text color={currentStep >= 3 ? 'brand.500' : 'gray.400'}>
                  Team & Collaboration
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Form */}
        <Card bg={cardBg}>
          <CardBody>
            {renderStep()}
          </CardBody>
        </Card>

        {/* Navigation */}
        <HStack justify="space-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            isDisabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <HStack>
            <Button variant="ghost">
              Save as Draft
            </Button>
            {currentStep < totalSteps ? (
              <Button
                colorScheme="brand"
                onClick={handleNext}
                isDisabled={!formData.title || !formData.description}
              >
                Next
              </Button>
            ) : (
              <Button
                colorScheme="brand"
                onClick={handleSubmit}
                isDisabled={!formData.title || !formData.description}
              >
                Create Startup
              </Button>
            )}
          </HStack>
        </HStack>
      </VStack>
    </Container>
  )
}

export default StartupCreate