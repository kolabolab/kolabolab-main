import React, { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Textarea,
  Select,
  Checkbox,
  CheckboxGroup,
  Badge,
  Icon,
  Image,
  SimpleGrid,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  IconButton,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { 
  FiUpload,
  FiX,
  FiPlus,
  FiCheck,
  FiArrowLeft,
  FiArrowRight,
  FiMapPin,
  FiUsers,
  FiCalendar
} from 'react-icons/fi'
import { Helmet } from 'react-helmet-async'

interface StartupForm {
  // Basic Information
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  website: string;
  stage: string;
  industry: string;
  location: string;
  foundedDate: string;
  
  // Team Information
  founderName: string;
  founderEmail: string;
  founderRole: string;
  founderBio: string;
  founderLinkedin: string;
  teamSize: number;
  lookingFor: string[];
  
  // Funding & Business
  fundingGoal: string;
  fundingRaised: string;
  businessModel: string;
  revenueModel: string;
  
  // Technology & Innovation
  technologies: string[];
  tags: string[];
  socialImpact: string;
  problemStatement: string;
  solution: string;
  
  // Media & Assets
  logo: File | null;
  coverImage: File | null;
  pitchDeck: File | null;
  demoVideo: string;
  
  // Legal & Compliance
  isIncorporated: boolean;
  intellectualProperty: string;
  agreeToTerms: boolean;
  publicProfile: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const CreateStartupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<StartupForm>({
    name: '',
    tagline: '',
    description: '',
    longDescription: '',
    website: '',
    stage: '',
    industry: '',
    location: '',
    foundedDate: '',
    founderName: '',
    founderEmail: '',
    founderRole: 'CEO & Founder',
    founderBio: '',
    founderLinkedin: '',
    teamSize: 1,
    lookingFor: [],
    fundingGoal: '',
    fundingRaised: '',
    businessModel: '',
    revenueModel: '',
    technologies: [],
    tags: [],
    socialImpact: '',
    problemStatement: '',
    solution: '',
    logo: null,
    coverImage: null,
    pitchDeck: null,
    demoVideo: '',
    isIncorporated: false,
    intellectualProperty: '',
    agreeToTerms: false,
    publicProfile: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newTechnology, setNewTechnology] = useState('');
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  const totalSteps = 5;
  const stepNames = ['Basic Info', 'Team Details', 'Business Model', 'Technology', 'Review & Submit'];

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.name) newErrors.name = 'Startup name is required';
        if (!formData.tagline) newErrors.tagline = 'Tagline is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.stage) newErrors.stage = 'Please select a stage';
        if (!formData.industry) newErrors.industry = 'Please select an industry';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.foundedDate) newErrors.foundedDate = 'Founded date is required';
        break;
      
      case 2:
        if (!formData.founderName) newErrors.founderName = 'Founder name is required';
        if (!formData.founderEmail) {
          newErrors.founderEmail = 'Founder email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.founderEmail)) {
          newErrors.founderEmail = 'Please enter a valid email address';
        }
        if (!formData.founderBio) newErrors.founderBio = 'Founder bio is required';
        if (formData.teamSize < 1) newErrors.teamSize = 'Team size must be at least 1';
        break;
      
      case 3:
        if (!formData.businessModel) newErrors.businessModel = 'Business model is required';
        if (!formData.problemStatement) newErrors.problemStatement = 'Problem statement is required';
        if (!formData.solution) newErrors.solution = 'Solution description is required';
        break;
      
      case 4:
        if (formData.technologies.length === 0) newErrors.technologies = 'Please add at least one technology';
        if (formData.tags.length === 0) newErrors.tags = 'Please add at least one tag';
        break;
      
      case 5:
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Startup Created Successfully!',
        description: 'Your startup profile has been submitted and is now live.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: 'There was an error creating your startup. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof StartupForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleAddTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData(prev => ({ ...prev, technologies: [...prev.technologies, newTechnology.trim()] }));
      setNewTechnology('');
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setFormData(prev => ({ ...prev, technologies: prev.technologies.filter(t => t !== tech) }));
  };

  const handleFileUpload = (field: 'logo' | 'coverImage' | 'pitchDeck') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md">Basic Information</Heading>
            
            {/* Logo Upload */}
            <FormControl>
              <FormLabel>Startup Logo</FormLabel>
              <VStack spacing={3}>
                {formData.logo ? (
                  <Box position="relative" display="inline-block">
                    <Image
                      src={URL.createObjectURL(formData.logo)}
                      alt="Logo preview"
                      boxSize="120px"
                      objectFit="cover"
                      borderRadius="lg"
                      border="2px dashed"
                      borderColor="gray.200"
                    />
                    <IconButton
                      icon={<FiX />}
                      size="sm"
                      position="absolute"
                      top={-2}
                      right={-2}
                      borderRadius="full"
                      onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
                      aria-label="Remove logo"
                    />
                  </Box>
                ) : (
                  <Box
                    as="label"
                    cursor="pointer"
                    w="120px"
                    h="120px"
                    border="2px dashed"
                    borderColor="gray.300"
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    _hover={{ borderColor: 'brand.400' }}
                  >
                    <VStack spacing={2}>
                      <Icon as={FiUpload} w={6} h={6} color="gray.400" />
                      <Text fontSize="sm" color="gray.500">Upload Logo</Text>
                    </VStack>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload('logo')}
                      style={{ display: 'none' }}
                    />
                  </Box>
                )}
              </VStack>
              <FormHelperText>Upload a square logo (recommended: 400x400px)</FormHelperText>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Startup Name *</FormLabel>
                <Input
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="e.g., EcoTech Solutions"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.tagline}>
                <FormLabel>Tagline *</FormLabel>
                <Input
                  value={formData.tagline}
                  onChange={handleInputChange('tagline')}
                  placeholder="One-line description of your startup"
                />
                <FormErrorMessage>{errors.tagline}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <FormControl isInvalid={!!errors.description}>
              <FormLabel>Short Description *</FormLabel>
              <Textarea
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Brief description of your startup (2-3 sentences)"
                rows={3}
              />
              <FormErrorMessage>{errors.description}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Detailed Description</FormLabel>
              <Textarea
                value={formData.longDescription}
                onChange={handleInputChange('longDescription')}
                placeholder="Detailed description of your startup, mission, and vision"
                rows={5}
              />
              <FormHelperText>Provide a comprehensive overview of your startup</FormHelperText>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.stage}>
                <FormLabel>Stage *</FormLabel>
                <Select
                  value={formData.stage}
                  onChange={handleInputChange('stage')}
                  placeholder="Select startup stage"
                >
                  <option value="Idea">Idea</option>
                  <option value="MVP">MVP</option>
                  <option value="Early Stage">Early Stage</option>
                  <option value="Growth">Growth</option>
                  <option value="Scale">Scale</option>
                  <option value="Mature">Mature</option>
                </Select>
                <FormErrorMessage>{errors.stage}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.industry}>
                <FormLabel>Industry *</FormLabel>
                <Select
                  value={formData.industry}
                  onChange={handleInputChange('industry')}
                  placeholder="Select industry"
                >
                  <option value="FinTech">FinTech</option>
                  <option value="HealthTech">HealthTech</option>
                  <option value="EdTech">EdTech</option>
                  <option value="CleanTech">CleanTech</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="SaaS">SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Social Impact">Social Impact</option>
                  <option value="Other">Other</option>
                </Select>
                <FormErrorMessage>{errors.industry}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.location}>
                <FormLabel>Location *</FormLabel>
                <Input
                  value={formData.location}
                  onChange={handleInputChange('location')}
                  placeholder="City, State/Country"
                />
                <FormErrorMessage>{errors.location}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.foundedDate}>
                <FormLabel>Founded Date *</FormLabel>
                <Input
                  type="date"
                  value={formData.foundedDate}
                  onChange={handleInputChange('foundedDate')}
                />
                <FormErrorMessage>{errors.foundedDate}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Website</FormLabel>
              <Input
                value={formData.website}
                onChange={handleInputChange('website')}
                placeholder="https://yourwebsite.com"
              />
            </FormControl>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md">Team Information</Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.founderName}>
                <FormLabel>Founder Name *</FormLabel>
                <Input
                  value={formData.founderName}
                  onChange={handleInputChange('founderName')}
                  placeholder="Full name"
                />
                <FormErrorMessage>{errors.founderName}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.founderEmail}>
                <FormLabel>Founder Email *</FormLabel>
                <Input
                  type="email"
                  value={formData.founderEmail}
                  onChange={handleInputChange('founderEmail')}
                  placeholder="founder@startup.com"
                />
                <FormErrorMessage>{errors.founderEmail}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Founder Role</FormLabel>
                <Input
                  value={formData.founderRole}
                  onChange={handleInputChange('founderRole')}
                  placeholder="e.g., CEO & Founder"
                />
              </FormControl>

              <FormControl isInvalid={!!errors.teamSize}>
                <FormLabel>Current Team Size *</FormLabel>
                <Input
                  type="number"
                  min={1}
                  value={formData.teamSize}
                  onChange={handleInputChange('teamSize')}
                />
                <FormErrorMessage>{errors.teamSize}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <FormControl isInvalid={!!errors.founderBio}>
              <FormLabel>Founder Bio *</FormLabel>
              <Textarea
                value={formData.founderBio}
                onChange={handleInputChange('founderBio')}
                placeholder="Tell us about the founder's background and experience"
                rows={4}
              />
              <FormErrorMessage>{errors.founderBio}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Founder LinkedIn</FormLabel>
              <Input
                value={formData.founderLinkedin}
                onChange={handleInputChange('founderLinkedin')}
                placeholder="linkedin.com/in/founder"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Looking For</FormLabel>
              <CheckboxGroup
                value={formData.lookingFor}
                onChange={(values) => setFormData(prev => ({ ...prev, lookingFor: values as string[] }))}
              >
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                  {['Co-founder', 'CTO', 'Lead Developer', 'Designer', 'Marketing Lead', 'Sales Lead', 'Advisor', 'Mentor', 'Investors', 'Beta Users'].map((role) => (
                    <Checkbox key={role} value={role}>{role}</Checkbox>
                  ))}
                </SimpleGrid>
              </CheckboxGroup>
              <FormHelperText>Select all that apply</FormHelperText>
            </FormControl>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md">Business Model & Funding</Heading>
            
            <FormControl isInvalid={!!errors.problemStatement}>
              <FormLabel>Problem Statement *</FormLabel>
              <Textarea
                value={formData.problemStatement}
                onChange={handleInputChange('problemStatement')}
                placeholder="What problem does your startup solve?"
                rows={3}
              />
              <FormErrorMessage>{errors.problemStatement}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.solution}>
              <FormLabel>Solution *</FormLabel>
              <Textarea
                value={formData.solution}
                onChange={handleInputChange('solution')}
                placeholder="How does your startup solve this problem?"
                rows={3}
              />
              <FormErrorMessage>{errors.solution}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.businessModel}>
              <FormLabel>Business Model *</FormLabel>
              <Select
                value={formData.businessModel}
                onChange={handleInputChange('businessModel')}
                placeholder="Select business model"
              >
                <option value="B2B SaaS">B2B SaaS</option>
                <option value="B2C SaaS">B2C SaaS</option>
                <option value="Marketplace">Marketplace</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Subscription">Subscription</option>
                <option value="Freemium">Freemium</option>
                <option value="Advertising">Advertising</option>
                <option value="Transaction-based">Transaction-based</option>
                <option value="Other">Other</option>
              </Select>
              <FormErrorMessage>{errors.businessModel}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Revenue Model</FormLabel>
              <Textarea
                value={formData.revenueModel}
                onChange={handleInputChange('revenueModel')}
                placeholder="Describe how your startup generates revenue"
                rows={3}
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Funding Goal</FormLabel>
                <Input
                  value={formData.fundingGoal}
                  onChange={handleInputChange('fundingGoal')}
                  placeholder="e.g., $500K, $2M"
                />
                <FormHelperText>How much funding are you seeking?</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Funding Raised</FormLabel>
                <Input
                  value={formData.fundingRaised}
                  onChange={handleInputChange('fundingRaised')}
                  placeholder="e.g., $100K, $1M"
                />
                <FormHelperText>How much have you raised so far?</FormHelperText>
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel>Social Impact</FormLabel>
              <Textarea
                value={formData.socialImpact}
                onChange={handleInputChange('socialImpact')}
                placeholder="Describe the positive impact your startup creates"
                rows={3}
              />
              <FormHelperText>How does your startup make the world better?</FormHelperText>
            </FormControl>
          </VStack>
        );

      case 4:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md">Technology & Innovation</Heading>
            
            <FormControl isInvalid={!!errors.technologies}>
              <FormLabel>Technologies Used *</FormLabel>
              <VStack spacing={3} align="stretch">
                <HStack spacing={2} flexWrap="wrap">
                  {formData.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      colorScheme="blue"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {tech}
                      <IconButton
                        icon={<FiX />}
                        size="xs"
                        variant="ghost"
                        ml={1}
                        onClick={() => handleRemoveTechnology(tech)}
                        aria-label={`Remove ${tech}`}
                      />
                    </Badge>
                  ))}
                </HStack>
                <HStack>
                  <Input
                    placeholder="Add a technology"
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTechnology()}
                  />
                  <Button onClick={handleAddTechnology} leftIcon={<FiPlus />}>
                    Add
                  </Button>
                </HStack>
              </VStack>
              <FormErrorMessage>{errors.technologies}</FormErrorMessage>
              <FormHelperText>Add programming languages, frameworks, tools, etc.</FormHelperText>
            </FormControl>

            <FormControl isInvalid={!!errors.tags}>
              <FormLabel>Tags *</FormLabel>
              <VStack spacing={3} align="stretch">
                <HStack spacing={2} flexWrap="wrap">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      colorScheme="brand"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {tag}
                      <IconButton
                        icon={<FiX />}
                        size="xs"
                        variant="ghost"
                        ml={1}
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove ${tag}`}
                      />
                    </Badge>
                  ))}
                </HStack>
                <HStack>
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} leftIcon={<FiPlus />}>
                    Add
                  </Button>
                </HStack>
              </VStack>
              <FormErrorMessage>{errors.tags}</FormErrorMessage>
              <FormHelperText>Add relevant keywords and categories</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Demo Video</FormLabel>
              <Input
                value={formData.demoVideo}
                onChange={handleInputChange('demoVideo')}
                placeholder="YouTube or Vimeo URL"
              />
              <FormHelperText>Share a demo or pitch video (optional)</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Pitch Deck</FormLabel>
              <Box
                as="label"
                cursor="pointer"
                w="full"
                h="100px"
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{ borderColor: 'brand.400' }}
              >
                {formData.pitchDeck ? (
                  <VStack spacing={2}>
                    <Icon as={FiCheck} w={6} h={6} color="green.500" />
                    <Text fontSize="sm" color="gray.700">{formData.pitchDeck.name}</Text>
                  </VStack>
                ) : (
                  <VStack spacing={2}>
                    <Icon as={FiUpload} w={6} h={6} color="gray.400" />
                    <Text fontSize="sm" color="gray.500">Upload Pitch Deck (PDF)</Text>
                  </VStack>
                )}
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload('pitchDeck')}
                  style={{ display: 'none' }}
                />
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel>Intellectual Property</FormLabel>
              <Textarea
                value={formData.intellectualProperty}
                onChange={handleInputChange('intellectualProperty')}
                placeholder="Describe any patents, trademarks, or proprietary technology"
                rows={3}
              />
            </FormControl>
          </VStack>
        );

      case 5:
        return (
          <VStack spacing={6} align="stretch">
            <Heading size="md">Review & Submit</Heading>
            
            {/* Preview Card */}
            <Card className="glass-panel">
              <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                  <HStack spacing={4} align="start">
                    {formData.logo && (
                      <Image
                        src={URL.createObjectURL(formData.logo)}
                        alt="Logo"
                        boxSize="80px"
                        objectFit="cover"
                        borderRadius="lg"
                      />
                    )}
                    <VStack align="start" spacing={2} flex={1}>
                      <Heading size="lg">{formData.name}</Heading>
                      <Text color="gray.600">{formData.tagline}</Text>
                      <HStack spacing={4} fontSize="sm">
                        <HStack spacing={1}>
                          <Icon as={FiMapPin} color="gray.400" />
                          <Text>{formData.location}</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={FiUsers} color="gray.400" />
                          <Text>{formData.teamSize} team members</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={FiCalendar} color="gray.400" />
                          <Text>Founded {new Date(formData.foundedDate).getFullYear()}</Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  </HStack>
                  
                  <Text>{formData.description}</Text>
                  
                  <HStack spacing={2} flexWrap="wrap">
                    <Badge colorScheme="blue">{formData.stage}</Badge>
                    <Badge colorScheme="purple">{formData.industry}</Badge>
                    {formData.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} colorScheme="gray">{tag}</Badge>
                    ))}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Legal & Terms */}
            <VStack spacing={4} align="stretch">
              <Checkbox
                isChecked={formData.isIncorporated}
                onChange={handleInputChange('isIncorporated')}
              >
                This startup is legally incorporated
              </Checkbox>

              <Checkbox
                isChecked={formData.publicProfile}
                onChange={handleInputChange('publicProfile')}
              >
                Make this startup profile public
              </Checkbox>

              <FormControl isInvalid={!!errors.agreeToTerms}>
                <Checkbox
                  isChecked={formData.agreeToTerms}
                  onChange={handleInputChange('agreeToTerms')}
                >
                  I agree to the Terms of Service and Privacy Policy *
                </Checkbox>
                <FormErrorMessage>{errors.agreeToTerms}</FormErrorMessage>
              </FormControl>
            </VStack>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold">Review your submission</Text>
                <Text fontSize="sm">
                  Please review all information carefully. You can edit your startup profile after submission.
                </Text>
              </VStack>
            </Alert>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Startup - KolaboLab</title>
        <meta 
          name="description" 
          content="Submit your startup to KolaboLab. Share your innovative idea and connect with collaborators and investors." 
        />
      </Helmet>

      <Box className="primary-context" py={8}>
        <Container maxW="4xl">
          <VStack spacing={8}>
            {/* Header */}
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" className="gradient-text">
                Create Your Startup Profile
              </Heading>
              <Text color="gray.600" fontSize="lg" maxW="2xl">
                Share your innovative startup with our community of entrepreneurs, collaborators, and investors
              </Text>
            </VStack>

            {/* Progress Bar */}
            <Card className="glass-panel" w="full">
              <CardBody p={6}>
                <VStack spacing={4}>
                  <HStack justify="space-between" w="full">
                    <Text fontWeight="semibold">Step {step} of {totalSteps}</Text>
                    <Text fontSize="sm" color="gray.600">{stepNames[step - 1]}</Text>
                  </HStack>
                  <Progress
                    value={(step / totalSteps) * 100}
                    colorScheme="brand"
                    size="lg"
                    borderRadius="full"
                    w="full"
                  />
                  <HStack justify="space-between" w="full" fontSize="xs" color="gray.500">
                    {stepNames.map((name, index) => (
                      <Text
                        key={name}
                        fontWeight={step === index + 1 ? 'bold' : 'normal'}
                        color={step > index ? 'brand.500' : 'gray.500'}
                      >
                        {name}
                      </Text>
                    ))}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Form Content */}
            <Card className="glass-panel" w="full">
              <CardBody p={8}>
                {renderStepContent()}
              </CardBody>
            </Card>

            {/* Navigation */}
            <HStack spacing={4} w="full" justify="space-between">
              <Button
                leftIcon={<FiArrowLeft />}
                variant="outline"
                onClick={handleBack}
                isDisabled={step === 1}
                size="lg"
              >
                Back
              </Button>

              {step === totalSteps ? (
                <Button
                  leftIcon={<FiCheck />}
                  variant="solid"
                  colorScheme="brand"
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  loadingText="Creating..."
                  size="lg"
                >
                  Create Startup
                </Button>
              ) : (
                <Button
                  rightIcon={<FiArrowRight />}
                  variant="solid"
                  colorScheme="brand"
                  onClick={handleNext}
                  size="lg"
                >
                  Next
                </Button>
              )}
            </HStack>
          </VStack>
        </Container>
      </Box>
    </>
  )
}

export default CreateStartupPage