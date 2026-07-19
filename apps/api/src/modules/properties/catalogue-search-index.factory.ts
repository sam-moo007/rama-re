import { Logger } from "@nestjs/common";

import type { CatalogueSearchIndexPort } from "./catalogue-search-index.port";
import { InMemoryCatalogueSearchIndex } from "./catalogue-search-index.port";
import { OpenSearchCatalogueSearchIndex } from "./opensearch-catalogue-search-index";

export type CatalogueSearchIndexDriver="memory"|"opensearch";
export const resolveCatalogueSearchIndexDriver=(environment:NodeJS.ProcessEnv=process.env):CatalogueSearchIndexDriver=>{const configured=environment.CATALOGUE_SEARCH_INDEX?.trim().toLowerCase();if(configured==="memory"||configured==="opensearch")return configured;if(configured)throw new Error("CATALOGUE_SEARCH_INDEX must be 'memory' or 'opensearch'.");return environment.NODE_ENV==="production"?"opensearch":"memory"};
export const createCatalogueSearchIndex=(environment:NodeJS.ProcessEnv=process.env):CatalogueSearchIndexPort=>{
  if(resolveCatalogueSearchIndexDriver(environment)==="memory"){if(environment.NODE_ENV==="production")throw new Error("In-memory catalogue search indexing is forbidden in production.");Logger.warn("Catalogue indexing uses the explicit in-memory development projection.","CatalogueSearchIndex");return new InMemoryCatalogueSearchIndex()}
  const rawUrl=environment.OPENSEARCH_URL?.trim();const apiKey=environment.OPENSEARCH_API_KEY?.trim();const indexName=environment.OPENSEARCH_CATALOGUE_INDEX?.trim()||"rama-properties-v1";
  const readAlias=environment.OPENSEARCH_CATALOGUE_ALIAS?.trim()||"rama-properties";
  if(!rawUrl)throw new Error("OPENSEARCH_URL is required for the OpenSearch catalogue index.");let url:URL;try{url=new URL(rawUrl)}catch{throw new Error("OPENSEARCH_URL must be a valid URL.")}
  if(environment.NODE_ENV==="production"&&url.protocol!=="https:")throw new Error("OPENSEARCH_URL must use HTTPS in production.");if(url.username||url.password)throw new Error("Credentials in OPENSEARCH_URL are forbidden; use OPENSEARCH_API_KEY.");
  if(!apiKey||apiKey.length<20)throw new Error("OPENSEARCH_API_KEY with at least 20 characters is required.");if(!/^[a-z0-9][a-z0-9_-]{2,63}$/.test(indexName))throw new Error("OPENSEARCH_CATALOGUE_INDEX must be a lowercase index name.");if(!/^[a-z0-9][a-z0-9_-]{2,63}$/.test(readAlias))throw new Error("OPENSEARCH_CATALOGUE_ALIAS must be a lowercase alias name.");
  Logger.log(`Catalogue indexing is using OpenSearch index '${indexName}' and read alias '${readAlias}'.`,"CatalogueSearchIndex");return new OpenSearchCatalogueSearchIndex(url.toString(),indexName,apiKey,fetch,readAlias);
};
