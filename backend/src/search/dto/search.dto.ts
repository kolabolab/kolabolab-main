import { IsString, IsOptional, IsArray, IsNumber, IsEnum, IsBoolean, ValidateNested, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum SearchType {
  FULL_TEXT = 'full_text',
  SEMANTIC = 'semantic',
  FUZZY = 'fuzzy',
  HYBRID = 'hybrid',
}

export enum SearchEntity {
  USERS = 'users',
  STARTUPS = 'startups',
  COLLABORATIONS = 'collaborations',
  INVESTMENTS = 'investments',
  ALL = 'all',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchFiltersDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fundingStages?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minFunding?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxFunding?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  remoteOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  verifiedOnly?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}

export class SearchSortDto {
  @IsOptional()
  @IsString()
  field?: string = '_score';

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;
}

export class SearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.HYBRID;

  @IsOptional()
  @IsEnum(SearchEntity)
  entity?: SearchEntity = SearchEntity.ALL;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  offset?: number = 0;

  @IsOptional()
  @ValidateNested()
  @Type(() => SearchFiltersDto)
  filters?: SearchFiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SearchSortDto)
  sort?: SearchSortDto;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeHighlights?: boolean = true;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeFacets?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Transform(({ value }) => parseFloat(value))
  minScore?: number = 0.1;
}

export class SuggestDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsEnum(SearchEntity)
  entity?: SearchEntity = SearchEntity.ALL;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}

export class AutocompleteDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsEnum(SearchEntity)
  entity?: SearchEntity = SearchEntity.ALL;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 5;

  @IsOptional()
  @IsString()
  field?: string = 'name';
}

export class BulkIndexDto {
  @IsEnum(SearchEntity)
  entity: SearchEntity;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  force?: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  @Transform(({ value }) => parseInt(value))
  batchSize?: number = 1000;
}