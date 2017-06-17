import { CarbAgcliPage } from './app.po';

describe('carb-agcli App', () => {
  let page: CarbAgcliPage;

  beforeEach(() => {
    page = new CarbAgcliPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
