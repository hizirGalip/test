import { Injectable } from '@angular/core';
import {  InterpolatableTranslationObject, InterpolationParameters, TranslateService, Translation, TranslationObject } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Language } from '../../enums/i18n/language';
import { SESSION_STORE_CULTURE } from '../../constants/session-store-consts';

@Injectable({
  providedIn: 'root'
})
export class KarmedTranslateService {

  constructor(private translateService: TranslateService) { }

  use(lang: Language): Observable<InterpolatableTranslationObject>{
    localStorage.setItem(SESSION_STORE_CULTURE, lang);
    return this.translateService.use(lang);
  }

  instant(key: string | string[], interpolateParams?: InterpolationParameters): Translation | TranslationObject {
    return this.translateService.instant(key, interpolateParams);
  }

  addLangs(langs: Language[]): void{
    this.translateService.addLangs(langs)
  }

  useSavedLanguage() : boolean{
    const lang = localStorage.getItem(SESSION_STORE_CULTURE);
    if (lang){
      this.translateService.use(lang);
      return true;
    }
    return false;
  }

  get CurrentLanguage(): Language {
    return localStorage.getItem(SESSION_STORE_CULTURE) as Language ?? Language.tr;
  }
}
