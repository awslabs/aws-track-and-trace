
export interface ConfigModel {
  general: {
    solutionName: string;
    description: string;
  };

  administrator: {
    name: string;
    email: string;
    username: string;
    phone?: string;
  };

  dns?: {
    domainName: string;
    hostedZoneId?: string,
    certificateArn?: string;
  }
}