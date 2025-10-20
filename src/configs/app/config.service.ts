import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return +this.configService.get('app.port')!
  }

  get env(): 'development' | 'production' {
    return this.configService.get('app.env')!
  }
}
