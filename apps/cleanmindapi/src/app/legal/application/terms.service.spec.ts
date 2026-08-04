import { TermsRepository } from '../domain/repositories/terms.repository';
import { TermsService } from './terms.service';

describe('TermsService', () => {
  const current = {
    id: 'terms-id',
    version: 'beta-1',
    title: 'Beta',
    documentUrl: '/beta',
    effectiveAt: new Date('2026-07-29T00:00:00.000Z'),
  };

  it('requires and then records acceptance of the current version', async () => {
    let accepted = false;
    const repository = {
      findCurrent: jest.fn().mockResolvedValue(current),
      hasAccepted: jest.fn().mockImplementation(() => accepted),
      accept: jest.fn().mockImplementation(() => {
        accepted = true;
      }),
    } as unknown as TermsRepository;
    const service = new TermsService(repository);

    await expect(service.requiresAcceptance('user-id')).resolves.toBe(true);
    await expect(service.acceptCurrent('user-id')).resolves.toMatchObject({
      version: 'beta-1',
      accepted: true,
    });
    await expect(service.requiresAcceptance('user-id')).resolves.toBe(false);
    expect(repository.accept).toHaveBeenCalledWith('user-id', 'terms-id');
  });
});
