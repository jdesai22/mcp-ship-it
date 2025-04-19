# Implementation Standards - MCP Technical Documentation Server

**Last Updated:** April 19, 2025  
**Memory Bank Status:** Complete  
**Workflow Phase:** Creation

## Memory Context
- **Informs:** Meta-Workflow Integration
- **Informed by:** Tech Stack, Dependencies Documentation, Project Structure, User Flows
- **Dependencies:** Windsurf workflow system

## Version History
| Date         | Editor | Changes             | Status  |
|--------------|--------|---------------------|---------|
| 04/19/2025   | Cascade | Initial creation    | Complete|

## Coding Standards

### General Principles

1. **Maximum File Size:** No file should exceed 200 lines. Decompose larger files into smaller, focused components or modules.

2. **DRY (Don't Repeat Yourself):** Avoid code duplication by extracting common functionality into reusable functions, components, or utilities.

3. **Single Responsibility Principle:** Each module, class, and function should have one responsibility and one reason to change.

4. **Memory-First Development:** Follow the Windsurf memory-based workflow for all development activities, ensuring all context is properly documented.

5. **Complete Implementation:** Never leave placeholder comments or incomplete implementations. All code must be fully functional and tested.

### TypeScript Standards

1. **Type Definitions**
   - Always define explicit return types for functions
   - Use interfaces for object shapes that represent entities
   - Use type aliases for unions, intersections, and simple object shapes
   - Avoid `any` type unless absolutely necessary
   - Leverage generics for reusable types

```typescript
// Good
interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  branchId: string;
}

type DocumentStatus = 'draft' | 'published' | 'archived';

function getDocument(id: string): Promise<Document> {
  // Implementation
}

// Bad
function getDocument(id): any {
  // Implementation
}
```

2. **Type Safety**
   - Enable strict mode in TypeScript configuration
   - Use non-nullable types where possible
   - Use type guards for narrowing types
   - Avoid type assertions (`as`) unless necessary

```typescript
// Good
function processDocument(document: Document | null): void {
  if (document === null) {
    return;
  }
  
  // Now TypeScript knows document is not null
  console.log(document.title);
}

// Bad
function processDocument(document: Document | null): void {
  console.log(document!.title); // Using non-null assertion
}
```

### React Component Standards

1. **Component Organization**
   - Use functional components with hooks
   - Follow the component structure outlined in the Project Structure document
   - Separate logic from presentation using custom hooks
   - Keep components small and focused

```typescript
// Good
import React from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentList } from '@/components/documents/DocumentList';

export const DocumentsPage: React.FC = () => {
  const { documents, loading, error } = useDocuments();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  
  return <DocumentList documents={documents} />;
};

// Bad
export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true);
        const response = await fetch('/api/documents');
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDocuments();
  }, []);
  
  // Rest of the component with rendering logic mixed in
};
```

2. **Props and State Management**
   - Define prop types using TypeScript interfaces
   - Use destructuring for props and state
   - Provide default props where appropriate
   - Use React Context for shared state across components
   - Use SWR for data fetching and caching

```typescript
// Good
interface DocumentCardProps {
  document: Document;
  onEdit?: (id: string) => void;
  expanded?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onEdit, 
  expanded = false 
}) => {
  // Component implementation
};

// Bad
export const DocumentCard = (props) => {
  const document = props.document;
  const onEdit = props.onEdit;
  const expanded = props.expanded || false;
  
  // Component implementation
};
```

### API Standards

1. **RESTful API Design**
   - Use resource-based URLs
   - Use HTTP methods appropriately (GET, POST, PUT, DELETE)
   - Return appropriate status codes
   - Implement proper error handling

```typescript
// Good API route structure
// GET /api/documents/{id}
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await documentService.getDocument(params.id);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

2. **API Response Format**
   - Consistent response structure across all endpoints
   - Include appropriate metadata
   - Handle errors with informative messages

```typescript
// Success response format
{
  "data": {
    // Resource data here
  },
  "meta": {
    "timestamp": "2025-04-19T16:45:32Z",
    "requestId": "abc123"
  }
}

// Error response format
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "The requested document could not be found",
    "details": {
      "id": "123456"
    }
  },
  "meta": {
    "timestamp": "2025-04-19T16:45:32Z",
    "requestId": "abc123"
  }
}
```

### Database Standards

1. **Schema Design**
   - Use singular names for table names (e.g., `document` not `documents`)
   - Follow consistent naming conventions for columns
   - Use foreign key constraints for relationships
   - Include `created_at` and `updated_at` timestamps on all tables
   - Use appropriate data types
   - Leverage Supabase's RLS (Row Level Security) for access control

```sql
-- Good schema design
CREATE TABLE document (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  branch_id UUID REFERENCES branch(id),
  team_id UUID REFERENCES team(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE document ENABLE ROW LEVEL SECURITY;

-- Create policy for team members
CREATE POLICY "Team members can read documents" ON document
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM team_member WHERE team_id = document.team_id
    )
  );
```

2. **Query Patterns**
   - Use parameterized queries to prevent SQL injection
   - Create indexes for frequently queried columns
   - Optimize queries for performance
   - Use transactions for operations that modify multiple tables

```typescript
// Good query pattern with Supabase
const getDocumentsByBranch = async (branchId: string): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('document')
    .select('*, branch:branch_id(*)')
    .eq('branch_id', branchId)
    .order('updated_at', { ascending: false });
    
  if (error) throw error;
  return data;
};
```

### Testing Standards

1. **Unit Testing**
   - Test each component and function in isolation
   - Use meaningful test descriptions
   - Follow the AAA pattern (Arrange, Act, Assert)
   - Aim for high test coverage (minimum 80%)
   - Mock external dependencies

```typescript
// Good unit test
describe('DocumentService', () => {
  describe('getDocument', () => {
    it('should return a document when given a valid ID', async () => {
      // Arrange
      const mockDocument = { id: '123', title: 'Test Document' };
      mockedSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockDocument,
              error: null,
            }),
          }),
        }),
      });
      
      // Act
      const result = await documentService.getDocument('123');
      
      // Assert
      expect(result).toEqual(mockDocument);
    });
    
    it('should throw an error when document is not found', async () => {
      // Arrange
      mockedSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });
      
      // Act & Assert
      await expect(documentService.getDocument('456')).rejects.toThrow();
    });
  });
});
```

2. **End-to-End Testing**
   - Test critical user flows
   - Use realistic test data
   - Test across supported browsers
   - Include authentication flows
   - Test error scenarios

```typescript
// Good E2E test with Playwright
test('user can create a new document', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // Navigate to documents page
  await page.goto('/documents');
  
  // Create new document
  await page.click('[data-testid="create-document-button"]');
  await page.fill('[data-testid="document-title-input"]', 'Test Document');
  await page.fill('[data-testid="document-content-input"]', 'This is a test document');
  await page.click('[data-testid="save-document-button"]');
  
  // Verify document was created
  await expect(page.locator('[data-testid="document-list"]')).toContainText('Test Document');
});
```

### Error Handling Standards

1. **Client-Side Error Handling**
   - Use try-catch blocks for async operations
   - Display user-friendly error messages
   - Log errors for debugging
   - Implement global error boundaries in React

```typescript
// Good client-side error handling
const useDocumentCreate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  
  const createDocument = async (documentData: DocumentCreateInput) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Failed to create document');
      }
      
      const newDocument = await response.json();
      router.push(`/documents/${newDocument.id}`);
      return newDocument;
    } catch (err) {
      const error = err as Error;
      setError(error);
      // Log to monitoring service
      captureException(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { createDocument, isLoading, error };
};
```

2. **Server-Side Error Handling**
   - Use middleware for consistent error handling
   - Log detailed errors server-side
   - Return appropriate status codes and error messages
   - Implement rate limiting and request validation

```typescript
// Error handling middleware
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errorId = uuidv4();
  
  // Determine status code and message
  let statusCode = 500;
  let message = 'Internal server error';
  
  if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.message;
  } else if (error instanceof AuthError) {
    statusCode = 401;
    message = error.message;
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    message = error.message;
  }
  
  // Log the error with context
  logger.error({
    errorId,
    error,
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    },
  });
  
  // Send response to client
  res.status(statusCode).json({
    error: {
      id: errorId,
      message,
    },
  });
}
```

### Windsurf Integration Standards

1. **Memory Bank Updates**
   - Update memory bank files when relevant code or documentation changes
   - Follow the structure defined in .windsurfrules
   - Maintain checksums for memory consistency

```typescript
// Memory bank update example
export async function updateMemoryBank(
  document: Document,
  changeType: 'create' | 'update' | 'delete'
): Promise<void> {
  try {
    // Map document to memory bank format
    const memoryContent = formatDocumentForMemory(document, changeType);
    
    // Update activeContext.md
    await updateActiveContextFile(memoryContent);
    
    // Update relevant memory files based on document type
    await updateSpecificMemoryFile(document.type, memoryContent);
    
    // Update checksum in memory-index.md
    await updateMemoryChecksum();
    
    logger.info(`Memory bank updated for document ${document.id}`);
  } catch (error) {
    logger.error('Failed to update memory bank:', error);
    throw new Error('Memory bank update failed');
  }
}
```

2. **Task Logging**
   - Create task logs for all significant development activities
   - Follow the task log format specified in .windsurfrules
   - Include performance evaluation with scoring
   - Document challenges and decisions

```typescript
// Task log creation example
export async function createTaskLog(
  taskDetails: TaskLogInput
): Promise<TaskLog> {
  try {
    const taskLog = {
      id: uuidv4(),
      date: new Date().toISOString(),
      timeStarted: taskDetails.timeStarted,
      timeCompleted: taskDetails.timeCompleted,
      filesModified: taskDetails.filesModified,
      goal: taskDetails.goal,
      implementation: taskDetails.implementation,
      challenges: taskDetails.challenges,
      decisions: taskDetails.decisions,
      performanceScore: calculatePerformanceScore(taskDetails),
      strengths: taskDetails.strengths,
      areasForImprovement: taskDetails.areasForImprovement,
      nextSteps: taskDetails.nextSteps,
    };
    
    // Save task log to database
    const { data, error } = await supabase
      .from('task_log')
      .insert(taskLog)
      .select()
      .single();
      
    if (error) throw error;
    
    // Create task log file in .windsurf/task-logs/
    await createTaskLogFile(data);
    
    return data;
  } catch (error) {
    logger.error('Failed to create task log:', error);
    throw new Error('Task log creation failed');
  }
}
```

### Performance Standards

1. **Frontend Performance**
   - Use Next.js image optimization
   - Implement code splitting
   - Optimize bundle size
   - Use proper caching strategies with SWR
   - Implement lazy loading for components

```typescript
// Good performance practices
// Code splitting with dynamic imports
const DocumentEditor = dynamic(() => import('@/components/documents/DocumentEditor'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Disable server-side rendering for this component
});

// Image optimization
import Image from 'next/image';

export const DocumentThumbnail: React.FC<{ src: string }> = ({ src }) => (
  <Image
    src={src}
    width={300}
    height={200}
    alt="Document thumbnail"
    placeholder="blur"
    blurDataURL="data:image/png;base64,..."
    loading="lazy"
  />
);
```

2. **API Performance**
   - Implement pagination for list endpoints
   - Use appropriate caching headers
   - Optimize database queries
   - Implement request batching where appropriate

```typescript
// Pagination example
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;
  
  try {
    const { count, data, error } = await supabase
      .from('document')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    return NextResponse.json({
      data,
      meta: {
        currentPage: page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalCount: count,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
```

### Security Standards

1. **Authentication and Authorization**
   - Use Supabase Auth for authentication
   - Implement role-based access control
   - Use Row Level Security in the database
   - Validate permissions on both client and server

```typescript
// Server-side permission check
export async function checkDocumentPermission(
  userId: string,
  documentId: string,
  action: 'read' | 'write' | 'delete'
): Promise<boolean> {
  const { data, error } = await supabase
    .from('document_permission')
    .select('permission')
    .eq('user_id', userId)
    .eq('document_id', documentId)
    .single();
    
  if (error || !data) return false;
  
  switch (action) {
    case 'read':
      return ['read', 'write', 'admin'].includes(data.permission);
    case 'write':
      return ['write', 'admin'].includes(data.permission);
    case 'delete':
      return data.permission === 'admin';
    default:
      return false;
  }
}
```

2. **Data Validation**
   - Validate all user inputs
   - Sanitize data to prevent XSS attacks
   - Use parameterized queries to prevent SQL injection
   - Implement CSRF protection

```typescript
// Input validation with zod
import { z } from 'zod';

const documentSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  branchId: z.string().uuid(),
  teamId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = documentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: { message: 'Invalid input', details: result.error.format() } },
        { status: 400 }
      );
    }
    
    // Process validated data
    const document = result.data;
    // ...
  } catch (error) {
    // ...
  }
}
```

## Documentation Self-Critique

### Creation Phase
Draft created on 04/19/2025 per `createImplementationStandards`.

### Self-Evaluation Phase
Checked against Dos/Don'ts (10 points total):
- Dos: Specific? Yes. Justified? Yes. Edge cases? Yes. Self-evaluated? Yes. Examples? Yes. (5/5)
- Don'ts: Avoided vague? Yes. Skipped rationale? No. Ignored readers? No. Overcomplicated? No. Unchecked? No. (5/5)
- **Score**: 10/10

### Review Phase
Scored against 5 criteria (baseline 4/5):
1. Comprehensive standards coverage - Yes
2. Clear code examples - Yes
3. Alignment with tech stack - Yes
4. Practical implementation guidance - Yes
5. Windsurf integration details - Yes
- **Initial Score**: 5/5

### Outcome
- Pass (5/5)

## Next Steps
1. Create Meta-Workflow Integration document
2. Review implementation standards with development team
3. Create linting configurations to enforce standards
4. Develop code templates for common patterns
