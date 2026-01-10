export enum PgSuccessfulCompletion {
  SuccessfulCompletion = '00000',
}

export enum PgWarning {
  Warning = '01000',
  DynamicResultSetsReturned = '0100C',
  ImplicitZeroBitPadding = '01008',
  NullValueEliminatedInSetFunction = '01003',
  PrivilegeNotGranted = '01007',
  PrivilegeNotRevoked = '01006',
  StringDataRightTruncation = '01004',
  DeprecatedFeature = '01P01',
}

export enum PgNoData {
  NoData = '02000',
  NoAdditionalDynamicResultSetsReturned = '02001',
}

export enum PgSqlStatementNotYetComplete {
  SqlStatementNotYetComplete = '03000',
}

export enum PgConnectionException {
  ConnectionException = '08000',
  ConnectionDoesNotExist = '08003',
  ConnectionFailure = '08006',
  SqlclientUnableToEstablishSqlconnection = '08001',
  SqlserverRejectedEstablishmentOfSqlconnection = '08004',
  TransactionResolutionUnknown = '08007',
  ProtocolViolation = '08P01',
}

export enum PgTriggeredActionException {
  TriggeredActionException = '09000',
}

export enum PgFeatureNotSupported {
  FeatureNotSupported = '0A000',
}

export enum PgInvalidTransactionInitiation {
  InvalidTransactionInitiation = '0B000',
}

export enum PgLocatorException {
  LocatorException = '0F000',
  InvalidLocatorSpecification = '0F001',
}

export enum PgInvalidGrantor {
  InvalidGrantor = '0L000',
  InvalidGrantOperation = '0LP01',
}

export enum PgInvalidRoleSpecification {
  InvalidRoleSpecification = '0P000',
}

export enum PgDiagnosticsException {
  DiagnosticsException = '0Z000',
  StackedDiagnosticsAccessedWithoutActiveHandler = '0Z002',
}

export enum PgCaseNotFound {
  CaseNotFound = '20000',
}

export enum PgCardinalityViolation {
  CardinalityViolation = '21000',
}

export enum PgDataException {
  DataException = '22000',
  ArraySubscriptError = '2202E',
  CharacterNotInRepertoire = '22021',
  DatetimeFieldOverflow = '22008',
  DivisionByZero = '22012',
  ErrorInAssignment = '22005',
  EscapeCharacterConflict = '2200B',
  IndicatorOverflow = '22022',
  IntervalFieldOverflow = '22015',
  InvalidArgumentForLogarithm = '2201E',
  InvalidArgumentForNtileFunction = '22014',
  InvalidArgumentForNthValueFunction = '22016',
  InvalidArgumentForPowerFunction = '2201F',
  InvalidArgumentForWidthBucketFunction = '2201G',
  InvalidCharacterValueForCast = '22018',
  InvalidDatetimeFormat = '22007',
  InvalidEscapeCharacter = '22019',
  InvalidEscapeOctet = '2200D',
  InvalidEscapeSequence = '22025',
  NonstandardUseOfEscapeCharacter = '22P06',
  InvalidIndicatorParameterValue = '22010',
  InvalidParameterValue = '22023',
  InvalidPrecedingOrFollowingSize = '22013',
  InvalidRegularExpression = '2201B',
  InvalidRowCountInLimitClause = '2201W',
  InvalidRowCountInResultOffsetClause = '2201X',
  InvalidTablesampleArgument = '2202H',
  InvalidTablesampleRepeat = '2202G',
  InvalidTimeZoneDisplacementValue = '22009',
  InvalidUseOfEscapeCharacter = '2200C',
  MostSpecificTypeMismatch = '2200G',
  NullValueNotAllowed = '22004',
  NullValueNoIndicatorParameter = '22002',
  NumericValueOutOfRange = '22003',
  SequenceGeneratorLimitExceeded = '2200H',
  StringDataLengthMismatch = '22026',
  StringDataRightTruncation = '22001',
  SubstringError = '22011',
  TrimError = '22027',
  UnterminatedCString = '22024',
  ZeroLengthCharacterString = '2200F',
  FloatingPointException = '22P01',
  InvaliduuidRepresentation = '22P02',
  InvalidBinaryRepresentation = '22P03',
  BadCopyFileFormat = '22P04',
  UntranslatableCharacter = '22P05',
  NotAnXmlDocument = '2200L',
  InvalidXmlDocument = '2200M',
  InvalidXmlContent = '2200N',
  InvalidXmlComment = '2200S',
  InvalidXmlProcessingInstruction = '2200T',
  DuplicateJsonObjectKeyValue = '22030',
  InvalidJsonuuid = '22032',
  InvalidSqlJsonSubscript = '22033',
  MoreThanOneSqlJsonItem = '22034',
  NoSqlJsonItem = '22035',
  NonNumericSqlJsonItem = '22036',
  NonUniqueKeysInAJsonObject = '22037',
  SingletonSqlJsonItemRequired = '22038',
  SqlJsonArrayNotFound = '22039',
  SqlJsonMemberNotFound = '2203A',
  SqlJsonNumberNotFound = '2203B',
  SqlJsonObjectNotFound = '2203C',
  TooManyJsonArrayElements = '2203D',
  TooManyJsonObjectMembers = '2203E',
  SqlJsonScalarRequired = '2203F',
}

export enum PgIntegrityConstraintViolation {
  IntegrityConstraintViolation = '23000',
  RestrictViolation = '23001',
  NotNullViolation = '23502',
  ForeignKeyViolation = '23503',
  UniqueViolation = '23505',
  CheckViolation = '23514',
  ExclusionViolation = '23P01',
}

export enum PgInvalidCursorState {
  InvalidCursorState = '24000',
}

export enum PgInvalidTransactionState {
  InvalidTransactionState = '25000',
  ActiveSqlTransaction = '25001',
  BranchTransactionAlreadyActive = '25002',
  HeldCursorRequiresSameIsolationLevel = '25008',
  InappropriateAccessModeForBranchTransaction = '25003',
  InappropriateIsolationLevelForBranchTransaction = '25004',
  NoActiveSqlTransactionForBranchTransaction = '25005',
  ReadOnlySqlTransaction = '25006',
  SchemaAndDataStatementMixingNotSupported = '25007',
  NoActiveSqlTransaction = '25P01',
  InFailedSqlTransaction = '25P02',
  IdleInTransactionSessionTimeout = '25P03',
}

export enum PgInvalidSqlStatementName {
  InvalidSqlStatementName = '26000',
}

export enum PgTriggeredDataChangeViolation {
  TriggeredDataChangeViolation = '27000',
}

export enum PgInvalidAuthorizationSpecification {
  InvalidAuthorizationSpecification = '28000',
  InvalidPassword = '28P01',
}

export enum PgDependentPrivilegeDescriptorsStillExist {
  DependentPrivilegeDescriptorsStillExist = '2B000',
  DependentObjectsStillExist = '2BP01',
}

export enum PgInvalidTransactionTermination {
  InvalidTransactionTermination = '2D000',
}

export enum PgSqlRoutineException {
  SqlRoutineException = '2F000',
  FunctionExecutedNoReturnStatement = '2F005',
  ModifyingSqlDataNotPermitted = '2F002',
  ProhibitedSqlStatementAttempted = '2F003',
  ReadingSqlDataNotPermitted = '2F004',
}

export enum PgInvalidCursorName {
  InvalidCursorName = '34000',
}

export enum PgExternalRoutineException {
  ExternalRoutineException = '38000',
  ContainingSqlNotPermitted = '38001',
  ModifyingSqlDataNotPermitted = '38002',
  ProhibitedSqlStatementAttempted = '38003',
  ReadingSqlDataNotPermitted = '38004',
}

export enum PgExternalRoutineInvocationException {
  ExternalRoutineInvocationException = '39000',
  InvalidSqlstateReturned = '39001',
  NullValueNotAllowed = '39004',
  TriggerProtocolViolated = '39P01',
  SrfProtocolViolated = '39P02',
  EventTriggerProtocolViolated = '39P03',
}

export enum PgSavepointException {
  SavepointException = '3B000',
  InvalidSavepointSpecification = '3B001',
}

export enum PgInvalidCatalogName {
  InvalidCatalogName = '3D000',
}

export enum PgInvalidSchemaName {
  InvalidSchemaName = '3F000',
}

export enum PgTransactionRollback {
  TransactionRollback = '40000',
  TransactionIntegrityConstraintViolation = '40002',
  SerializationFailure = '40001',
  StatementCompletionUnknown = '40003',
  DeadlockDetected = '40P01',
}

export enum PgSyntaxErrorOrAccessRuleViolation {
  SyntaxErrorOrAccessRuleViolation = '42000',
  SyntaxError = '42601',
  InsufficientPrivilege = '42501',
  CannotCoerce = '42846',
  GroupingError = '42803',
  WindowingError = '42P20',
  InvalidRecursion = '42P19',
  InvalidForeignKey = '42830',
  InvalidName = '42602',
  NameTooLong = '42622',
  ReservedName = '42939',
  DatatypeMismatch = '42804',
  IndeterminateDatatype = '42P18',
  CollationMismatch = '42P21',
  IndeterminateCollation = '42P22',
  WrongObjectType = '42809',
  GeneratedAlways = '428C9',
  UndefinedColumn = '42703',
  UndefinedFunction = '42883',
  UndefinedTable = '42P01',
  UndefinedParameter = '42P02',
  UndefinedObject = '42704',
  DuplicateColumn = '42701',
  DuplicateCursor = '42P03',
  DuplicateDatabase = '42P04',
  DuplicateFunction = '42723',
  DuplicatePreparedStatement = '42P05',
  DuplicateSchema = '42P06',
  DuplicateTable = '42P07',
  DuplicateAlias = '42712',
  DuplicateObject = '42710',
  AmbiguousColumn = '42702',
  AmbiguousFunction = '42725',
  AmbiguousParameter = '42P08',
  AmbiguousAlias = '42P09',
  InvalidColumnReference = '42P10',
  InvalidColumnDefinition = '42611',
  InvalidCursorDefinition = '42P11',
  InvalidDatabaseDefinition = '42P12',
  InvalidFunctionDefinition = '42P13',
  InvalidPreparedStatementDefinition = '42P14',
  InvalidSchemaDefinition = '42P15',
  InvalidTableDefinition = '42P16',
  InvalidObjectDefinition = '42P17',
}

export enum PgWithCheckOptionViolation {
  WithCheckOptionViolation = '44000',
}

export enum PgInsufficientResources {
  InsufficientResources = '53000',
  DiskFull = '53100',
  OutOfMemory = '53200',
  TooManyConnections = '53300',
  ConfigurationLimitExceeded = '53400',
}

export enum PgProgramLimitExceeded {
  ProgramLimitExceeded = '54000',
  StatementTooComplex = '54001',
  TooManyColumns = '54011',
  TooManyArguments = '54023',
}

export enum PgObjectNotInPrerequisiteState {
  ObjectNotInPrerequisiteState = '55000',
  ObjectInUse = '55006',
  CantChangeRuntimeParam = '55P02',
  LockNotAvailable = '55P03',
  UnsafeNewEnumValueUsage = '55P04',
}

export enum PgOperatorIntervention {
  OperatorIntervention = '57000',
  QueryCanceled = '57014',
  AdminShutdown = '57P01',
  CrashShutdown = '57P02',
  CannotConnectNow = '57P03',
  DatabaseDropped = '57P04',
}

export enum PgSystemError {
  SystemError = '58000',
  IoError = '58030',
  UndefinedFile = '58P01',
  DuplicateFile = '58P02',
}

export enum PgSnapshotFailure {
  SnapshotTooOld = '72000',
}

export enum PgConfigurationFileError {
  ConfigFileError = 'F0000',
  LockFileExists = 'F0001',
}

export enum PgForeignDataWrapperError {
  FdwError = 'HV000',
  FdwColumnNameNotFound = 'HV005',
  FdwDynamicParameterValueNeeded = 'HV002',
  FdwFunctionSequenceError = 'HV010',
  FdwInconsistentDescriptorInformation = 'HV021',
  FdwInvalidAttributeValue = 'HV024',
  FdwInvalidColumnName = 'HV007',
  FdwInvalidColumnNumber = 'HV008',
  FdwInvalidDataType = 'HV004',
  FdwInvalidDataTypeDescriptors = 'HV006',
  FdwInvalidDescriptorFieldIdentifier = 'HV091',
  FdwInvalidHandle = 'HV00B',
  FdwInvalidOptionIndex = 'HV00C',
  FdwInvalidOptionName = 'HV00D',
  FdwInvalidStringLengthOrBufferLength = 'HV090',
  FdwInvalidStringFormat = 'HV00A',
  FdwInvalidUseOfNullPointer = 'HV009',
  FdwTooManyHandles = 'HV014',
  FdwOutOfMemory = 'HV001',
  FdwNoSchemas = 'HV00P',
  FdwOptionNameNotFound = 'HV00J',
  FdwReplyHandle = 'HV00K',
  FdwSchemaNotFound = 'HV00Q',
  FdwTableNotFound = 'HV00R',
  FdwUnableToCreateExecution = 'HV00L',
  FdwUnableToCreateReply = 'HV00M',
  FdwUnableToEstablishConnection = 'HV00N',
}

export enum PgPlPgsqlError {
  PlpgsqlError = 'P0000',
  RaiseException = 'P0001',
  NoDataFound = 'P0002',
  TooManyRows = 'P0003',
  AssertFailure = 'P0004',
}

export enum PgInternalError {
  InternalError = 'XX000',
  DataCorrupted = 'XX001',
  IndexCorrupted = 'XX002',
}
