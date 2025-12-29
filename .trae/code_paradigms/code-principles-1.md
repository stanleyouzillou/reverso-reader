To ensure a consistent and scalable codebase for any project, the following guidelines are divided into specialized instruction files. These guidelines prioritize testability, flexibility, and maintainability while focusing on conquering complexity 1-3.

1. CORE_PHILOSOPHY.md
   Goal: Establish the mindset for creating code that serves users, customers, and developers cost-effectively 4, 5.
   Conquer Complexity: Distinguish between Essential Complexity (the nature of the problem) and Accidental Complexity (implementation details) 6, 7. Always seek the simplest way to represent the problem 8.
   Human-Centered Design (HCD): Write code for humans first; optimize for discoverability (finding where to change things) and understanding (knowing how to change them) 9, 10.
   Strategic Programming: Avoid the "Tactical Approach" of brute-forcing solutions 11. Spend 50% of the effort on ensuring the code is maintainable for future developers 12.
   The Principle of Last Responsible Moment: Delay irreversible architectural decisions until they are absolutely necessary to avoid rework 13, 14.
2. PROJECT_STRUCTURE.md
   Goal: Implement a "Screaming Architecture" where the folder structure reflects the system's capabilities, not its frameworks 15, 16.
   Feature-Driven Organization: Organize code into Vertical Slices based on use cases (e.g., createUser, makeOffer) 17, 18.
   Cohesive Folders: Group files related to a specific feature (controllers, tests, use cases) together to reduce cognitive load and "flipping" between folders 15, 19, 20.
   Layered Boundaries: Separate code into three distinct layers:
   Domain Layer: Core business rules and data (Entities, Value Objects) 21, 22.
   Application Layer: Orchestration logic (Use Cases) 23, 24.
   Infrastructure Layer: External concerns (Databases, APIs, Web Servers) 25, 26.
   Shared Content: Generic utilities (Date, Text) and global configuration belong in a top-level /shared directory 15, 27.
3. CODING_STANDARDS.md
   Goal: Maintain high readability through consistent patterns and meaningful communication 28, 29.
   Ubiquitous Language: Use the same terminology in code as the domain experts use in conversation 30, 31.
   Naming Principles:
   Consistency: Use one unique name for each concept across the project 28, 32.
   Understandability: Describe what is inside a variable or what a function does, not how it works 33, 34.
   Austerity: Avoid clever, "cute," or culturally specific names that may lose meaning over time 35, 36.
   Comments as a Last Resort: Code should explain what and how; comments should only explain why something complex was necessary 37-39.
   Object Calisthenics: Use these "drills" during refactoring:
   Only one level of indentation per method 40, 41.
   No else keyword (use guard clauses or polymorphism) 40, 42.
   Wrap all primitives and strings into Value Objects 40, 43.
4. DESIGN_PRINCIPLES.md
   Goal: Apply Responsibility-Driven Design (RDD) to create neighborhoods of collaborating objects 44, 45.
   Responsibility-First: Convert requirements into responsibilities (obligations to know or do), assign them to roles, and define their collaborations 46-48.
   Object Stereotypes: Every object should fit a clear role: Information Holder, Structurer, Service Provider, Coordinator, Controller, or Interfacer 46, 49-55.
   SOLID Principles:
   Single Responsibility: A class should have only one reason to change 56, 57.
   Open-Closed: Open for extension, closed for modification 56, 58.
   Dependency Inversion: High-level modules must depend on abstractions (interfaces), not concrete implementations 59, 60.
   Behavioral Basics:
   CQS (Command Query Separation): Methods should either change state or return data, never both 61, 62.
   Tell, Don’t Ask: Tell an object to perform a task instead of asking for its data to do it yourself 63, 64.
5. TESTING_WORKFLOW.md
   Goal: Ensure correctness and prevent regressions through a disciplined TDD workflow 65, 66.
   Double Loop TDD:
   Outer Loop: Write a failing Acceptance Test based on a user story 67, 68.
   Inner Loop: Write failing Unit Tests to drive the internal design of the core code until the acceptance test passes 67, 69.
   The Three Laws of TDD: No production code without a failing test; write only enough of a test to fail; write only enough code to pass 65, 70.
   Triangulation: Add multiple examples to your tests to evolve the code from specific (hardcoded) to generic (algorithmic) 71, 72.
   Test Anatomy: Use Arrange-Act-Assert (AAA) to structure tests. If stuck, write the Assert phase first to clarify the goal 71, 73, 74.
   Transformation Priority Premise (TPP): When moving from red to green, prefer simpler code transformations (e.g., constant to scalar) before complex ones (e.g., if to loop) 75, 76.
6. ERROR_HANDLING.md
   Goal: Make the implicit explicit to prevent "surprise" failures 77, 78.
   Errors vs. Exceptions: Model Errors as domain concepts (e.g., UserAlreadyExists). Use Exceptions only for truly unexpected technical failures (e.g., database connection lost) 77, 79-81.
   Fail Fast: Throw exceptions immediately when a consumer provides invalid input so they can fix it 82, 83.
   Explicit Returns: Prefer using a Result or Either type to return both success and failure states, rather than returning null or throwing errors 77, 84, 85.
   Encapsulation: Wrap I/O code in try-catch blocks and turn technical exceptions into meaningful domain errors before they reach the consumer 82, 86.
   Analogy: Building a project with these guidelines is like building with LEGO. Each pattern is a standard brick 87. By following the "instructions" (structure and principles), you ensure that no matter how large the castle gets, every piece fits perfectly and the structure remains stable enough to be expanded or rearranged without everything collapsing 88.

While the initial guidelines provide a strong foundation for a clean and maintainable codebase, the sources suggest that additional specialized documentation is necessary to specifically handle the challenges of an existing legacy codebase and to ensure long-term scalability.
To make your guidelines truly framework and architecture agnostic while scaling a codebase, you should add the following three instruction files. These focus on mitigating risk during refactoring and balancing system growth without strictly mandating Domain-Driven Design (DDD). 7. LEGACY_REFACTORING.md
Goal: Safely transform an existing, potentially "smelly" codebase into a clean one without introducing regressions.
Characterization Testing: Before changing existing code, write Characterization Tests to document and verify the current behavior of the system, even if it is buggy 1.
The Boy Scout Rule: Commit to leaving the code cleaner than you found it by performing small, incremental refactors during every task 2.
Refactor Under the Safety of Tests: Never attempt structural refactoring without a passing test suite to catch regressions immediately 2, 3.
Identify Impasses: Use the Transformation Priority Premise (TPP) to avoid "deadlocks" in design, preferring simple code changes (like changing a constant to a variable) before jumping to complex logic 4-6.
Breaking Chains: Detect Message Chains (e.g., a.getB().getC().doD()) and refactor them into direct methods to follow the Law of Demeter 7, 8. 8. SCALABILITY_STRATEGY.md
Goal: Prepare the codebase and the team for growth in complexity, users, and developer count.
Productivity Scalability: Enforce static typing (e.g., TypeScript) to catch "silly mistakes" early and provide the abstraction constructs needed to scale the team’s output 9, 10.
Modular Monolith: Start by organizing the system as a Modular Monolith rather than jumping to microservices 11, 12. This allows the code to be split into separate deployments later if needed, based on socio-technical opportunities 12.
System Quality Attributes (SQAs): Identify which non-functional requirements (e.g., scalability, resilience, or security) are critical for the project and choose architectural patterns that support them 13, 14.
Consistency as a Force Multiplier: Establish Shared Understanding through consistent naming and project structure to allow developers to move between features without a high cognitive load 15, 16. 9. FRAMEWORK_INDEPENDENCE.md
Goal: Ensure the system’s core logic is not "strangled" by external libraries or frameworks.
The Adapter Layer: Implement an Adapter Layer (Ports & Adapters) to keep core application code separate from external technologies like databases, web servers, or third-party APIs 17, 18.
Persistence Ignorance: Write the Core Code (business logic) so that it knows nothing about how data is stored or retrieved, relying instead on interfaces 19, 20.
Fight the Framework: Do not let a framework’s default folder structure dictate your architecture; if necessary, tuck framework-specific code away in a /shared/infrastructure folder 21-23.
Program to Interfaces: High-level modules must depend on abstractions, not on concrete framework classes (Dependency Inversion Principle), which makes it possible to swap or mock dependencies during testing 17, 24, 25.
Analogy: Restructuring a legacy codebase for scalability is like renovating a historic building while people are still living in it. You cannot simply knock down all the walls at once (refactoring without tests). Instead, you must first create a detailed blueprint of the existing structure (characterization testing), reinforce the foundation (decoupling infrastructure), and then modernize one room at a time (feature-driven vertical slices) to ensure the building remains standing and functional as it grows.
