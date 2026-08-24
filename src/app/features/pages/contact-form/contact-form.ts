import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

/**
 * Static rendering of the Contact Us form from Figma node 2546:220300.
 *
 * The fields are real inputs so the layout can be checked and the page reads correctly, but there
 * is no endpoint behind it — submitting is deliberately inert (see onSubmit). Wiring it up needs a
 * backend to receive the request; until then the form must not imply a message was sent.
 */
@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private readonly language = inject(LanguageService);

  private readonly isArabic = computed(() => this.language.language() === 'ar');

  protected readonly t = computed(() => (this.isArabic() ? AR : EN));
}

const EN = {
  firstName: 'First Name',
  firstNamePlaceholder: 'Enter first name',
  lastName: 'Last Name',
  lastNamePlaceholder: 'Enter last name',
  nationalId: 'National ID / Iqama Number',
  nationalIdPlaceholder: 'Enter National ID / Iqama number',
  email: 'Email Address',
  emailPlaceholder: 'Enter email address',
  mobile: 'Mobile Number',
  mobilePlaceholder: '00 000 0000',
  requestType: 'Select Request Type',
  requestTypePlaceholder: 'Select request type',
  subject: 'Message Subject',
  subjectPlaceholder: 'Enter message subject',
  details: 'Request Details',
  detailsPlaceholder: 'Enter request details',
  attachments: 'Attachments Upload',
  attachmentsHint: 'The maximum allowed file size is 2 MB. Supported file formats include: PDF, JPG, and PNG.',
  browse: 'Browse Files',
  submit: 'Submit Request',
  required: 'required',
};

const AR = {
  firstName: 'الاسم الأول',
  firstNamePlaceholder: 'أدخل الاسم الأول',
  lastName: 'اسم العائلة',
  lastNamePlaceholder: 'أدخل اسم العائلة',
  nationalId: 'رقم الهوية / الإقامة',
  nationalIdPlaceholder: 'أدخل رقم الهوية / الإقامة',
  email: 'البريد الإلكتروني',
  emailPlaceholder: 'أدخل البريد الإلكتروني',
  mobile: 'رقم الجوال',
  mobilePlaceholder: '00 000 0000',
  requestType: 'نوع الطلب',
  requestTypePlaceholder: 'اختر نوع الطلب',
  subject: 'موضوع الرسالة',
  subjectPlaceholder: 'أدخل موضوع الرسالة',
  details: 'تفاصيل الطلب',
  detailsPlaceholder: 'أدخل تفاصيل الطلب',
  attachments: 'إرفاق الملفات',
  attachmentsHint: 'الحد الأقصى المسموح لحجم الملف 2 ميجابايت. الصيغ المدعومة: PDF و JPG و PNG.',
  browse: 'استعراض الملفات',
  submit: 'إرسال الطلب',
  required: 'مطلوب',
};
