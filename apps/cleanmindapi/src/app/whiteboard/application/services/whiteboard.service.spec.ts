import { WHITEBOARD_VERSION } from '../../domain/models/whiteboard.model';
import { WhiteboardRepository } from '../../domain/repositories/whiteboard.repository';
import { WhiteboardService } from './whiteboard.service';

describe('WhiteboardService', () => {
  function createService(repository: Partial<WhiteboardRepository> = {}) {
    const mockedRepository = {
      findByUserId: jest.fn().mockResolvedValue(null),
      upsert: jest.fn(),
      ...repository,
    } as unknown as WhiteboardRepository;

    return {
      service: new WhiteboardService(mockedRepository),
      repository: mockedRepository,
    };
  }

  it('returns an empty versioned document before the first save', async () => {
    const { service } = createService();

    await expect(service.get('user-id')).resolves.toEqual({
      version: WHITEBOARD_VERSION,
      elements: [],
      backgroundImage: null,
      savedColors: [],
      updatedAt: null,
    });
  });

  it('persists the complete document for the authenticated user', async () => {
    const document = {
      version: WHITEBOARD_VERSION,
      elements: [],
      backgroundImage: null,
      savedColors: ['#8B5CF6'],
    };
    const { service, repository } = createService({
      upsert: jest.fn().mockResolvedValue({
        ...document,
        updatedAt: new Date(),
      }),
    });

    await service.save('user-id', document);

    expect(repository.upsert).toHaveBeenCalledWith('user-id', document);
  });
});
