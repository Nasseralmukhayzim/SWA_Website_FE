import { toProseList } from './prose-list';

describe('toProseList', () => {
  it('reads a run of short sentences as a list', () => {
    const body =
      'حماية مصالح المستفيدين في منظومة المياه. تطوير القدرات وتعزيز الكفاءة. ' +
      'تعزيز الابتكار والرقمنة داخل منظومة المياه';

    expect(toProseList(body)).toEqual([
      'حماية مصالح المستفيدين في منظومة المياه',
      'تطوير القدرات وتعزيز الكفاءة',
      'تعزيز الابتكار والرقمنة داخل منظومة المياه',
    ]);
  });

  it('leaves running prose alone', () => {
    const body =
      'تمثل استراتيجية الهيئة السعودية للمياه إطارًا لتطوير قطاع المياه، حيث توجه تنظيم القطاع ' +
      'وتعزز كفاءته واستدامته، بما يدعم تحقيق مستهدفات رؤية السعودية 2030 في الأمن المائي وجودة الحياة.';

    expect(toProseList(body)).toBeNull();
  });

  it('needs more than a couple of sentences before it counts as a list', () => {
    expect(toProseList('جملة أولى. جملة ثانية.')).toBeNull();
  });

  it('strips the markup the rich text editor emits and honours its line breaks', () => {
    const body = '<p>البند الأول<br>البند الثاني<br>- البند الثالث</p>';

    expect(toProseList(body)).toEqual(['البند الأول', 'البند الثاني', 'البند الثالث']);
  });

  it('returns null for empty content', () => {
    expect(toProseList(null)).toBeNull();
    expect(toProseList('')).toBeNull();
    expect(toProseList('<p></p>')).toBeNull();
  });
});
